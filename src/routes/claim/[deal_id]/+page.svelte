<script lang="ts">
	import { fromNullable } from '@dfinity/utils';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Backdrop from '$lib/components/Backdrop.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import Button from '$lib/components/Button.svelte';
	import Countdown from '$lib/components/Countdown.svelte';
	import DealStatusDot from '$lib/components/DealStatusDot.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import Login from '$lib/components/Login.svelte';
	import Money from '$lib/components/Money.svelte';
	import PandaMark from '$lib/components/PandaMark.svelte';
	import { ICP_TOKEN } from '$lib/constants/tokens.constants';
	import { userSignedIn } from '$lib/derived/user.derived';
	import { acceptDeal, getClaimableDeal } from '$lib/services/deal.services';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ClaimableDeal, Deal } from '$lib/types/deal';
	import { dealStatus } from '$lib/utils/deal.utils';

	let dealId = $derived(parseDealId(page.params.deal_id ?? ''));
	let claimCode = $derived(page.url.searchParams.get('code') ?? undefined);

	let preview: ClaimableDeal | undefined = $state(undefined);
	let claimed: Deal | undefined = $state(undefined);
	let progress = $state(false);
	let loadError: string | undefined = $state(undefined);
	let claimError: string | undefined = $state(undefined);

	const reload = async () => {
		preview = undefined;
		loadError = undefined;

		if (dealId === undefined) {
			loadError = $i18n.detail.not_found;

			return;
		}

		if (!$userSignedIn) {
			return;
		}

		try {
			preview = await getClaimableDeal({ dealId });
		} catch (err) {
			loadError = err instanceof Error ? err.message : String(err);
		}
	};

	$effect(() => {
		reload();
	});

	const claim = async () => {
		if (dealId === undefined) {
			return;
		}

		progress = true;
		claimError = undefined;

		try {
			claimed = await acceptDeal({ dealId, claimCode });
		} catch (err) {
			claimError = err instanceof Error ? err.message : String(err);
			console.error('acceptDeal failed:', err);
		} finally {
			progress = false;
		}
	};

	let title = $derived.by((): string | undefined => {
		const p = preview;

		return p === undefined
			? undefined
			: (fromNullable(p.title) ?? $i18n.claim.preview_title_fallback);
	});

	let note = $derived.by((): string | undefined => {
		const p = preview;

		return p === undefined ? undefined : fromNullable(p.note);
	});

	function parseDealId(text: string): bigint | undefined {
		try {
			return BigInt(text);
		} catch {
			return undefined;
		}
	}
</script>

<svelte:head>
	<title>{$i18n.claim.title} · {$i18n.layout.title}</title>
</svelte:head>

<BrandHeader title={$i18n.claim.title}>
	{#snippet leading()}
		<IconButton
			ariaLabel={$i18n.core.text.back_to_dashboard}
			variant="ghost"
			onclick={() => goto('/')}
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M15 18l-6-6 6-6" />
			</svg>
		</IconButton>
	{/snippet}
</BrandHeader>

<section class="flex flex-1 flex-col gap-5 px-6 pt-6 pb-10">
	{#if !$userSignedIn}
		<div class="flex flex-1 flex-col items-center justify-center gap-6 text-center">
			<PandaMark size="lg" />
			<h2 class="text-h6 text-default font-bold">{$i18n.claim.signin_title}</h2>
			<p class="text-body1 text-muted">{$i18n.claim.signin_description}</p>
			<Login fullWidth />
		</div>
	{:else if loadError !== undefined}
		<div class="border-danger/40 bg-danger/10 flex flex-col gap-3 rounded-xl border p-5">
			<h2 class="text-h6 text-default font-bold">{$i18n.claim.load_error_title}</h2>
			<p class="text-body2 text-default">{loadError}</p>
			<Button variant="secondary" onclick={reload}>{$i18n.core.text.try_again}</Button>
		</div>
	{:else if claimed !== undefined}
		<div class="flex flex-col items-center gap-5 text-center">
			<PandaMark size="lg" />
			<h2 class="text-h5 text-success font-bold">{$i18n.claim.settled_title}</h2>
			<p class="text-body1 text-default">{$i18n.claim.settled_description}</p>

			<dl
				class="border-success/40 bg-success/5 flex w-full flex-col gap-2 rounded-xl border p-4 text-left"
			>
				<div class="flex items-baseline justify-between">
					<dt class="text-body2 text-muted">{$i18n.deals.row.amount}</dt>
					<dd><Money amount={claimed.amount} size="lg" /></dd>
				</div>
				<div class="flex items-baseline justify-between">
					<dt class="text-body2 text-muted">{$i18n.claim.status_field}</dt>
					<dd><DealStatusDot status={dealStatus(claimed)} /></dd>
				</div>
				<div class="flex items-baseline justify-between">
					<dt class="text-body2 text-muted">{$i18n.claim.deal_field}</dt>
					<dd class="text-default font-mono">#{claimed.id.toString()}</dd>
				</div>
			</dl>

			<Button fullWidth onclick={() => goto('/')}>{$i18n.core.text.open_dashboard}</Button>
		</div>
	{:else if preview !== undefined}
		<div
			class="border-border-soft bg-bg shadow-primary/5 flex flex-col gap-3 rounded-xl border p-5 shadow-sm"
		>
			<header class="flex items-start justify-between gap-3">
				<h2 class="text-h6 text-default font-bold">{title}</h2>
				<DealStatusDot status={dealStatus(preview)} />
			</header>

			{#if note !== undefined}
				<p class="text-body1 text-default">{note}</p>
			{/if}

			<dl class="border-border-soft flex flex-col gap-2 border-t pt-3">
				<div class="flex items-baseline justify-between">
					<dt class="text-body2 text-muted">{$i18n.deals.row.amount}</dt>
					<dd><Money amount={preview.amount} token={ICP_TOKEN} size="lg" /></dd>
				</div>
				<div class="flex items-baseline justify-between">
					<dt class="text-body2 text-muted">{$i18n.deals.row.expires}</dt>
					<dd><Countdown expiresAtNs={preview.expires_at_ns} /></dd>
				</div>
				<div class="flex items-baseline justify-between">
					<dt class="text-body2 text-muted">{$i18n.deals.row.recipient}</dt>
					<dd class="text-body2 text-default">
						{preview.is_recipient_bound ? $i18n.claim.recipient_bound : $i18n.claim.recipient_open}
					</dd>
				</div>
			</dl>
		</div>

		{#if claimCode === undefined}
			<p
				class="border-warning/40 bg-warning/10 text-body2 text-default rounded-md border p-3"
				role="note"
			>
				{$i18n.claim.missing_code}
			</p>
		{/if}

		{#if claimError !== undefined}
			<p
				class="border-danger bg-danger/10 text-body2 text-danger rounded-md border p-3"
				role="alert"
			>
				{claimError}
			</p>
		{/if}

		<Button onclick={claim} loading={progress} fullWidth>
			{$i18n.claim.submit}
		</Button>
	{:else}
		<p class="text-body2 text-muted" aria-live="polite">{$i18n.claim.loading_preview}</p>
	{/if}
</section>

{#if progress}
	<Backdrop spinner />
{/if}
