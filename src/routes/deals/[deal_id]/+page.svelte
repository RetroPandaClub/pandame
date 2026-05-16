<script lang="ts">
	import { fromNullable } from '@dfinity/utils';
	import { Principal } from '@icp-sdk/core/principal';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import Backdrop from '$lib/components/Backdrop.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import Button from '$lib/components/Button.svelte';
	import Countdown from '$lib/components/Countdown.svelte';
	import DealActions from '$lib/components/DealActions.svelte';
	import DealStatusIcon from '$lib/components/DealStatusIcon.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import Money from '$lib/components/Money.svelte';
	import ShareLinkModal from '$lib/components/ShareLinkModal.svelte';
	import { ICP_TOKEN } from '$lib/constants/tokens.constants';
	import { userPrincipalText } from '$lib/derived/user.derived';
	import { DealStatuses, SignatureStates, type SignatureState } from '$lib/enums/deal-status';
	import { getDeal } from '$lib/services/deal.services';
	import { dealsStore } from '$lib/stores/deals.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Deal, DealSide } from '$lib/types/deal';
	import { consentState, dealStatus, sideOf, signatureState } from '$lib/utils/deal.utils';
	import { nsToDate, shortPrincipal } from '$lib/utils/format.utils';

	let dealId = $derived(parseDealId(page.params.deal_id ?? ''));
	let deal: Deal | undefined = $state(undefined);
	let progress = $state(false);
	let loadError: string | undefined = $state(undefined);
	let shareOpen = $state(false);

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

	let principal = $derived(parsePrincipal($userPrincipalText));
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
	// `panel_size` is `Option<u32>` on `DealView` (verbatim from
	// `Deal.panel_size`) — `Some(n)` means the creator pinned `n` at
	// `create_deal` time; `None` means "use whatever
	// `DisputeConfig.panel_size` is current at `open_dispute`". We
	// surface both shapes so the counterparty sees the committed term
	// before consenting.
	let panelSize = $derived.by(() =>
		deal === undefined ? undefined : fromNullable(deal.panel_size)
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

	let payerSignature = $derived.by(() =>
		deal === undefined ? undefined : signatureState(deal.payer_signature)
	);
	let recipientSignature = $derived.by(() =>
		deal === undefined ? undefined : signatureState(deal.recipient_signature)
	);

	// "Waiting on …" callout fires only on Funded bound deals where
	// exactly one side has signed. Tip flows always carry `Empty` and
	// terminal states have nothing to wait on. Mirrors the upstream
	// auto-YES tally rule (a single `Yes` doesn't settle on its own —
	// the counterparty must also sign).
	let waitingOnPayer = $derived(
		status === DealStatuses.Funded &&
			recipientSignature !== undefined &&
			recipientSignature !== SignatureStates.Empty &&
			payerSignature === SignatureStates.Empty
	);
	let waitingOnRecipient = $derived(
		status === DealStatuses.Funded &&
			payerSignature !== undefined &&
			payerSignature !== SignatureStates.Empty &&
			recipientSignature === SignatureStates.Empty
	);

	const signatureLabel = (s: SignatureState): string => {
		switch (s) {
			case SignatureStates.Yes:
				return $i18n.detail.signature_yes;
			case SignatureStates.No:
				return $i18n.detail.signature_no;
			case SignatureStates.Empty:
				return $i18n.detail.signature_empty;
		}
	};

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

<AuthGuard />

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
			<DealStatusIcon {status} />
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

		<div class="border-border-soft bg-bg-elevated flex flex-col gap-3 rounded-xl border p-4">
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

		<div class="border-border-soft bg-bg-elevated flex flex-col gap-3 rounded-xl border p-4">
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
			{#if payerSignature !== undefined}
				<div class="flex items-baseline justify-between">
					<dt class="text-body2 text-muted">{$i18n.detail.signature_payer}</dt>
					<dd class="text-body2 text-default">{signatureLabel(payerSignature)}</dd>
				</div>
			{/if}
			{#if recipientSignature !== undefined}
				<div class="flex items-baseline justify-between">
					<dt class="text-body2 text-muted">{$i18n.detail.signature_recipient}</dt>
					<dd class="text-body2 text-default">{signatureLabel(recipientSignature)}</dd>
				</div>
			{/if}
			<div class="flex items-baseline justify-between">
				<dt class="text-body2 text-muted">{$i18n.deals.row.your_role}</dt>
				<dd class="text-body2 text-default capitalize">{mySide}</dd>
			</div>
			<div class="flex items-baseline justify-between">
				<dt class="text-body2 text-muted">{$i18n.detail.panel_size}</dt>
				<dd class="text-body2 text-default">
					{#if panelSize !== undefined}
						{$i18n.detail.panel_size_value.replace('{n}', String(panelSize))}
					{:else}
						{$i18n.detail.panel_size_default}
					{/if}
				</dd>
			</div>
		</div>

		{#if waitingOnPayer}
			<p
				class="border-border-soft bg-bg-soft text-body2 text-default rounded-xl border px-4 py-3"
				role="status"
			>
				{$i18n.detail.waiting_on_payer}
			</p>
		{:else if waitingOnRecipient}
			<p
				class="border-border-soft bg-bg-soft text-body2 text-default rounded-xl border px-4 py-3"
				role="status"
			>
				{$i18n.detail.waiting_on_recipient}
			</p>
		{/if}

		{#if status === DealStatuses.Aborted}
			<p
				class="border-warning bg-warning/10 text-body2 text-default rounded-xl border px-4 py-3"
				role="status"
			>
				{$i18n.deals.status.aborted_description}
			</p>
		{/if}

		{#if note !== undefined}
			<div class="border-border-soft bg-bg-elevated flex flex-col gap-2 rounded-xl border p-4">
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
