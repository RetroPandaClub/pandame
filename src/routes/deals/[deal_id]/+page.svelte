<script lang="ts">
	import { fromNullable } from '@dfinity/utils';
	import { Principal } from '@icp-sdk/core/principal';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import Backdrop from '$lib/components/Backdrop.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import Button from '$lib/components/Button.svelte';
	import Countdown from '$lib/components/Countdown.svelte';
	import DealActions from '$lib/components/DealActions.svelte';
	import DealStatusDot from '$lib/components/DealStatusDot.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import Money from '$lib/components/Money.svelte';
	import ShareLinkModal from '$lib/components/ShareLinkModal.svelte';
	import { ICP_TOKEN } from '$lib/constants/tokens.constants';
	import { userSignedIn } from '$lib/derived/user.derived';
	import { getDeal } from '$lib/services/deal.services';
	import { dealsStore } from '$lib/stores/deals.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { userStore } from '$lib/stores/user.store';
	import type { Deal, DealSide } from '$lib/types/deal';
	import { consentState, dealStatus, sideOf } from '$lib/utils/deal.utils';
	import { nsToDate, shortPrincipal } from '$lib/utils/format.utils';

	let dealId = $derived(parseDealId(page.params.deal_id ?? ''));
	let deal: Deal | undefined = $state(undefined);
	let progress = $state(false);
	let loadError: string | undefined = $state(undefined);
	let shareOpen = $state(false);

	$effect(() => {
		if (!$userSignedIn) {
			goto('/');
		}
	});

	const reload = async () => {
		if (dealId === undefined) {
			loadError = $i18n.detail.not_found;

			return;
		}

		progress = true;
		loadError = undefined;

		try {
			deal = await getDeal({ dealId });
			dealsStore.upsert(deal);
		} catch (err) {
			loadError = err instanceof Error ? err.message : String(err);
			console.error('getDeal failed:', err);
		} finally {
			progress = false;
		}
	};

	$effect(() => {
		reload();
	});

	let principal = $derived(parsePrincipal($userStore?.key));
	let mySide: DealSide = $derived(deal !== undefined ? sideOf(deal, principal) : 'unknown');
	let status = $derived(deal !== undefined ? dealStatus(deal) : undefined);
	let title = $derived.by((): string => {
		if (deal === undefined || dealId === undefined) {
			return $i18n.detail.title.replace('{id}', '?');
		}

		const fromDeal = fromNullable(deal.title);

		return fromDeal ?? $i18n.detail.title.replace('{id}', dealId.toString());
	});
	let note = $derived.by(() => (deal === undefined ? undefined : fromNullable(deal.note)));
	let payer = $derived.by(() => (deal === undefined ? undefined : fromNullable(deal.payer)));
	let recipient = $derived.by(() =>
		deal === undefined ? undefined : fromNullable(deal.recipient)
	);
	let claimCode = $derived.by(() =>
		deal === undefined ? undefined : fromNullable(deal.claim_code)
	);
	let createdAt = $derived.by(() =>
		deal === undefined ? undefined : nsToDate(deal.created_at_ns)
	);
	let fundedAt = $derived.by(() => {
		if (deal === undefined) {
			return undefined;
		}

		const ns = fromNullable(deal.funded_at_ns);

		return ns === undefined ? undefined : nsToDate(ns);
	});

	function parseDealId(text: string): bigint | undefined {
		try {
			return BigInt(text);
		} catch {
			return undefined;
		}
	}

	function parsePrincipal(text: string | undefined): Principal | undefined {
		if (text === undefined || text.length === 0) {
			return undefined;
		}

		try {
			return Principal.fromText(text);
		} catch {
			return undefined;
		}
	}
</script>

<svelte:head>
	<title>{title} · {$i18n.layout.title}</title>
</svelte:head>

<BrandHeader {title}>
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

	{#snippet trailing()}
		{#if status !== undefined}
			<DealStatusDot {status} />
		{/if}
	{/snippet}
</BrandHeader>

<section class="flex flex-1 flex-col gap-5 px-6 pt-6 pb-28">
	{#if loadError !== undefined}
		<p class="border-danger bg-danger/10 text-body2 text-danger rounded-md border p-3" role="alert">
			{loadError}
		</p>
		<Button onclick={reload}>{$i18n.core.text.try_again}</Button>
	{:else if deal === undefined}
		<p class="text-body2 text-muted" aria-live="polite">{$i18n.detail.loading}</p>
	{:else}
		<div
			class="border-border-soft bg-bg-soft flex items-center justify-between rounded-xl border p-4"
		>
			<span class="text-body1 text-default font-semibold">{ICP_TOKEN.name}</span>
			<Money amount={deal.amount} size="lg" />
		</div>

		<div class="border-border-soft bg-bg flex flex-col gap-3 rounded-xl border p-4">
			<div class="flex items-baseline justify-between">
				<dt class="text-body2 text-muted">{$i18n.deals.row.expires}</dt>
				<dd><Countdown expiresAtNs={deal.expires_at_ns} /></dd>
			</div>
			<div class="flex items-baseline justify-between">
				<dt class="text-body2 text-muted">{$i18n.detail.created_at}</dt>
				<dd class="text-body2 text-default">
					<time datetime={createdAt?.toISOString() ?? ''}>{createdAt?.toLocaleString() ?? ''}</time>
				</dd>
			</div>
			{#if fundedAt !== undefined}
				<div class="flex items-baseline justify-between">
					<dt class="text-body2 text-muted">{$i18n.detail.funded_at}</dt>
					<dd class="text-body2 text-default">
						<time datetime={fundedAt.toISOString()}>{fundedAt.toLocaleString()}</time>
					</dd>
				</div>
			{/if}
		</div>

		<div class="border-border-soft bg-bg flex flex-col gap-3 rounded-xl border p-4">
			<div class="flex items-baseline justify-between">
				<dt class="text-body2 text-muted">{$i18n.detail.counterparty_payer}</dt>
				<dd class="text-body2 text-default font-mono">
					{payer ? shortPrincipal(payer) : $i18n.deals.row.none}
				</dd>
			</div>
			<div class="flex items-baseline justify-between">
				<dt class="text-body2 text-muted">{$i18n.detail.counterparty_recipient}</dt>
				<dd class="text-body2 text-default font-mono">
					{recipient ? shortPrincipal(recipient) : $i18n.deals.row.recipient_open}
				</dd>
			</div>
			<div class="flex items-baseline justify-between">
				<dt class="text-body2 text-muted">{$i18n.detail.consent_payer}</dt>
				<dd class="text-body2 text-default capitalize">
					{consentState(deal.payer_consent).toLowerCase()}
				</dd>
			</div>
			<div class="flex items-baseline justify-between">
				<dt class="text-body2 text-muted">{$i18n.detail.consent_recipient}</dt>
				<dd class="text-body2 text-default capitalize">
					{consentState(deal.recipient_consent).toLowerCase()}
				</dd>
			</div>
			<div class="flex items-baseline justify-between">
				<dt class="text-body2 text-muted">{$i18n.deals.row.your_role}</dt>
				<dd class="text-body2 text-default capitalize">{mySide}</dd>
			</div>
		</div>

		{#if note !== undefined}
			<div class="border-border-soft bg-bg flex flex-col gap-2 rounded-xl border p-4">
				<dt class="text-body2 text-muted">{$i18n.detail.note_label}</dt>
				<dd class="text-body1 text-default">{note}</dd>
			</div>
		{/if}

		{#if claimCode !== undefined}
			<Button
				variant="secondary"
				fullWidth
				onclick={() => {
					shareOpen = true;
				}}
			>
				{$i18n.detail.share_cta}
			</Button>
		{/if}

		<DealActions {deal} />
	{/if}
</section>

<AppBottomNav />

{#if shareOpen && deal !== undefined}
	<ShareLinkModal
		open
		dealId={deal.id}
		claimCode={deal.claim_code}
		onclose={() => (shareOpen = false)}
	/>
{/if}

{#if progress && deal === undefined}
	<Backdrop spinner />
{/if}
