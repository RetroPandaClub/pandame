<script lang="ts">
	import { fromNullable } from '@dfinity/utils';
	import { page } from '$app/state';
	import Backdrop from '$lib/components/Backdrop.svelte';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import DealStatusBadge from '$lib/components/DealStatusBadge.svelte';
	import Login from '$lib/components/Login.svelte';
	import Logout from '$lib/components/Logout.svelte';
	import { ICP_TOKEN } from '$lib/constants/tokens.constants';
	import { userSignedIn } from '$lib/derived/user.derived';
	import { acceptDeal, getClaimableDeal } from '$lib/services/deal.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { userStore } from '$lib/stores/user.store';
	import type { ClaimableDeal, Deal } from '$lib/types/deal';
	import { dealStatus } from '$lib/utils/deal.utils';
	import { formatTokenAmount, nsToDate } from '$lib/utils/format.utils';

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
			loadError = 'Invalid deal id in the URL.';

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

	let amountStr = $derived.by((): string | undefined => {
		const p = preview;

		return p === undefined ? undefined : formatTokenAmount(p.amount, ICP_TOKEN);
	});

	let title = $derived.by((): string | undefined => {
		const p = preview;

		return p === undefined ? undefined : (fromNullable(p.title) ?? $i18n.deals.row.untitled);
	});

	let note = $derived.by((): string | undefined => {
		const p = preview;

		return p === undefined ? undefined : fromNullable(p.note);
	});

	let expiresAt = $derived.by((): Date | undefined => {
		const p = preview;

		return p === undefined ? undefined : nsToDate(p.expires_at_ns);
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

<section class="mx-auto mt-12 max-w-xl space-y-6 dark:text-white">
	<header class="space-y-2">
		<a href="/" class="text-sm underline">{$i18n.core.text.back_to_dashboard}</a>
		<h1 class="text-3xl font-bold">{$i18n.claim.title}</h1>
		{#if claimCode === undefined}
			<p class="text-sm opacity-75">{$i18n.claim.missing_code}</p>
		{/if}
	</header>

	{#if !$userSignedIn}
		<Card title={$i18n.claim.signin_title}>
			<p class="text-sm">{$i18n.claim.signin_description}</p>
			{#snippet footer()}
				<Login />
			{/snippet}
		</Card>
	{:else if loadError !== undefined}
		<Card title={$i18n.claim.load_error_title}>
			<p class="text-sm text-red-700">{loadError}</p>
			{#snippet footer()}
				<Button onclick={reload}>{$i18n.core.text.try_again}</Button>
			{/snippet}
		</Card>
	{:else if claimed !== undefined}
		<Card title={$i18n.claim.settled_title}>
			<p>{$i18n.claim.settled_description}</p>
			<dl class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
				<dt class="opacity-60">{$i18n.deals.row.amount}</dt>
				<dd class="text-right font-mono">{formatTokenAmount(claimed.amount, ICP_TOKEN)}</dd>
				<dt class="opacity-60">{$i18n.claim.status_field}</dt>
				<dd class="text-right">
					<DealStatusBadge status={dealStatus(claimed)} />
				</dd>
				<dt class="opacity-60">{$i18n.claim.deal_field}</dt>
				<dd class="text-right">#{claimed.id.toString()}</dd>
			</dl>
			{#snippet footer()}
				<a href="/" class="underline">{$i18n.core.text.open_dashboard}</a>
			{/snippet}
		</Card>
	{:else if preview !== undefined}
		<Card title={title ?? $i18n.claim.preview_title_fallback}>
			{#if note !== undefined}
				<p class="text-sm opacity-80">{note}</p>
			{/if}
			<dl class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
				<dt class="opacity-60">{$i18n.deals.row.amount}</dt>
				<dd class="text-right font-mono">{amountStr}</dd>
				<dt class="opacity-60">{$i18n.claim.status_field}</dt>
				<dd class="text-right">
					<DealStatusBadge status={dealStatus(preview)} />
				</dd>
				<dt class="opacity-60">{$i18n.deals.row.expires}</dt>
				<dd class="text-right">
					{#if expiresAt !== undefined}
						<time datetime={expiresAt.toISOString()}>{expiresAt.toLocaleString()}</time>
					{/if}
				</dd>
				<dt class="opacity-60">{$i18n.deals.row.recipient}</dt>
				<dd class="text-right">
					{preview.is_recipient_bound ? $i18n.claim.recipient_bound : $i18n.claim.recipient_open}
				</dd>
			</dl>

			{#if claimError !== undefined}
				<p class="rounded-sm border-2 border-red-600 bg-red-50 p-2 text-sm text-red-700">
					{claimError}
				</p>
			{/if}

			{#snippet footer()}
				<small class="mr-auto text-xs opacity-60">
					{$i18n.core.text.signed_in_as}
					{$userStore?.key}
				</small>
				<Logout />
				<Button onclick={claim} disabled={progress}>
					{progress ? $i18n.claim.submitting : $i18n.claim.submit}
				</Button>
			{/snippet}
		</Card>
	{:else}
		<p class="text-sm opacity-75">{$i18n.claim.loading_preview}</p>
	{/if}
</section>

{#if progress}
	<Backdrop spinner />
{/if}
