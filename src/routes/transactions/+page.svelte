<script lang="ts">
	import { Principal } from '@icp-sdk/core/principal';
	import { page } from '$app/state';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import DealCard from '$lib/components/DealCard.svelte';
	import DisputeCard from '$lib/components/DisputeCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import Sheet from '$lib/components/Sheet.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import UploadCTA from '$lib/components/UploadCTA.svelte';
	import UserPrincipalBadge from '$lib/components/UserPrincipalBadge.svelte';
	import { dealsLoaded } from '$lib/derived/deals.derived';
	import { disputesLoaded } from '$lib/derived/disputes.derived';
	import { userPrincipalText } from '$lib/derived/user.derived';
	import { ConsentStates, DealStatuses, SignatureStates } from '$lib/enums/deal-status';
	import {
		cancelDeal,
		consentDeal,
		listMyDeals,
		rejectDeal,
		signNo,
		signYes
	} from '$lib/services/deal.services';
	import { listMyDisputes } from '$lib/services/dispute.services';
	import { dealsStore } from '$lib/stores/deals.store';
	import { disputesStore } from '$lib/stores/disputes.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Deal } from '$lib/types/deal';
	import { consentState, dealStatus, sideOf, signatureState } from '$lib/utils/deal.utils';

	type Tab = 'pending' | 'active' | 'disputed';

	const TABS: readonly Tab[] = ['pending', 'active', 'disputed'];

	const isTab = (value: string | null): value is Tab =>
		value !== null && (TABS as readonly string[]).includes(value);

	// Stale `?tab=` links (including the legacy `?tab=created`) fall back to the default.
	const initialTab = (): Tab => {
		const raw = page.url.searchParams.get('tab');
		return isTab(raw) ? raw : 'pending';
	};

	let tab: Tab = $state(initialTab());

	let principal = $derived.by(() => {
		const text = $userPrincipalText;
		if (text === undefined || text.length === 0) {
			return undefined;
		}
		try {
			return Principal.fromText(text);
		} catch {
			return undefined;
		}
	});

	// Open-deal buckets, sliced by lifecycle gate:
	//   Pending  → `Created` (consent gate)
	//   Active   → `Funded`  (signature gate)
	// Terminal statuses (Settled / Refunded / Cancelled / …) live on the
	// History page, not here.
	const matches = (deal: Deal, t: Tab): boolean => {
		if (sideOf(deal, principal) === 'unknown') {
			return false;
		}
		const status = dealStatus(deal);
		switch (t) {
			case 'pending':
				return status === DealStatuses.Created;
			case 'active':
				return status === DealStatuses.Funded;
			case 'disputed':
				// Disputes render from `disputesStore`, not from this filter.
				return false;
		}
	};

	// Pending → freshest first (latest creation up top). Active → most
	// urgent first (closest to expiry up top, so the user reacts before
	// `expires_at_ns` triggers the auto-refund).
	const compareBigInt = (a: bigint, b: bigint): number => (a < b ? -1 : a > b ? 1 : 0);

	let visibleDeals = $derived.by(() => {
		const filtered = ($dealsStore ?? []).filter((deal) => matches(deal, tab));
		switch (tab) {
			case 'pending':
				return filtered.sort((a, b) => compareBigInt(b.created_at_ns, a.created_at_ns));
			case 'active':
				return filtered.sort((a, b) => compareBigInt(a.expires_at_ns, b.expires_at_ns));
			default:
				return filtered;
		}
	});
	let visibleDisputes = $derived($disputesStore ?? []);

	// `undefined` when the viewer isn't a party (public preview) — the
	// card just won't expose any inline actions.
	const myConsentOf = (deal: Deal) => {
		const side = sideOf(deal, principal);
		if (side === 'unknown') {
			return undefined;
		}
		return side === 'payer'
			? consentState(deal.payer_consent)
			: consentState(deal.recipient_consent);
	};

	const theirConsentOf = (deal: Deal) => {
		const side = sideOf(deal, principal);
		if (side === 'unknown') {
			return undefined;
		}
		return side === 'payer'
			? consentState(deal.recipient_consent)
			: consentState(deal.payer_consent);
	};

	const mySignatureOf = (deal: Deal) => {
		const side = sideOf(deal, principal);
		if (side === 'unknown') {
			return undefined;
		}
		return side === 'payer'
			? signatureState(deal.payer_signature)
			: signatureState(deal.recipient_signature);
	};

	const reloadDeals = async () => {
		try {
			const deals = await listMyDeals();
			dealsStore.set(deals);
		} catch (err) {
			console.error('Failed to refresh deals:', err);
		}
	};

	const reloadDisputes = async () => {
		try {
			const disputes = await listMyDisputes();
			disputesStore.set(disputes);
		} catch (err) {
			console.error('Failed to refresh disputes:', err);
		}
	};

	const reload = async () => {
		await Promise.all([reloadDeals(), reloadDisputes()]);
	};

	$effect(() => {
		reload();
	});

	const onConsent = (deal: Deal) => async () => {
		try {
			await consentDeal({ deal });
			await reloadDeals();
		} catch (err) {
			console.error('Failed to consent deal:', err);
		}
	};

	const onReject = (deal: Deal) => async () => {
		try {
			await rejectDeal({ dealId: deal.id });
			await reloadDeals();
		} catch (err) {
			console.error('Failed to reject deal:', err);
		}
	};

	const onCancel = (deal: Deal) => async () => {
		try {
			await cancelDeal({ dealId: deal.id });
			await reloadDeals();
		} catch (err) {
			console.error('Failed to cancel deal:', err);
		}
	};

	const onSignYes = (deal: Deal) => async () => {
		try {
			await signYes({ dealId: deal.id });
			await reloadDeals();
		} catch (err) {
			console.error('Failed to confirm completion:', err);
		}
	};

	const onSignNo = (deal: Deal) => async () => {
		try {
			await signNo({ dealId: deal.id });
			await reloadDeals();
		} catch (err) {
			console.error('Failed to reject completion:', err);
		}
	};

	let emptyDescription = $derived.by(() => {
		switch (tab) {
			case 'pending':
				return $i18n.transactions.empty_pending;
			case 'active':
				return $i18n.transactions.empty_active;
			case 'disputed':
				return $i18n.transactions.empty_disputed;
		}
	});

	let listLoaded = $derived(tab === 'disputed' ? $disputesLoaded : $dealsLoaded);
	let listEmpty = $derived(
		tab === 'disputed' ? visibleDisputes.length === 0 : visibleDeals.length === 0
	);
</script>

<svelte:head>
	<title>{$i18n.transactions.title} · {$i18n.layout.title}</title>
</svelte:head>

<svelte:window onjunoExampleReload={reload} />

<AuthGuard />

<BrandHeader title={$i18n.transactions.title}>
	{#snippet trailing()}
		<UserPrincipalBadge />
	{/snippet}

	<Tabs
		bind:value={tab}
		ariaLabel="Transaction status"
		tabs={[
			{ id: 'pending', label: $i18n.transactions.tab_pending },
			{ id: 'active', label: $i18n.transactions.tab_active },
			{ id: 'disputed', label: $i18n.transactions.tab_disputed }
		]}
	/>
</BrandHeader>

<Sheet paddingClass="px-[19px] pt-[26px] pb-[120px]" class="gap-[16px]">
	{#if !listLoaded}
		<p class="text-body2 text-muted" aria-live="polite">{$i18n.core.text.loading}</p>
	{:else if listEmpty}
		<EmptyState title={$i18n.transactions.empty_title} description={emptyDescription} />
	{:else if tab === 'disputed'}
		<ul class="flex flex-col gap-[16px]">
			{#each visibleDisputes as dispute (dispute.id)}
				<li>
					<DisputeCard {dispute} href={`/deals/${dispute.deal_id}/dispute`} />
				</li>
			{/each}
		</ul>
	{:else if tab === 'pending'}
		<ul class="flex flex-col gap-[16px]">
			{#each visibleDeals as deal (deal.id)}
				<li>
					<DealCard {deal} href={`/deals/${deal.id}`} showPanelSize>
						{#snippet actions()}
							{#if myConsentOf(deal) === ConsentStates.Pending}
								<button
									type="button"
									onclick={onConsent(deal)}
									class="bg-success text-default-inverse flex h-[24px] w-[58px] items-center justify-center rounded-[5px] font-sans text-[10px] font-semibold transition-opacity hover:opacity-90"
								>
									{$i18n.deals.actions.consent}
								</button>
								<button
									type="button"
									onclick={onReject(deal)}
									class="bg-danger text-default-inverse flex h-[24px] w-[58px] items-center justify-center rounded-[5px] font-sans text-[10px] font-semibold transition-opacity hover:opacity-90"
								>
									{$i18n.deals.actions.reject}
								</button>
							{:else if theirConsentOf(deal) === ConsentStates.Pending}
								<button
									type="button"
									onclick={onCancel(deal)}
									class="bg-danger text-default-inverse flex h-[24px] w-[58px] items-center justify-center rounded-[5px] font-sans text-[10px] font-semibold transition-opacity hover:opacity-90"
								>
									{$i18n.deals.actions.cancel}
								</button>
							{/if}
						{/snippet}
					</DealCard>
				</li>
			{/each}
		</ul>
	{:else}
		<ul class="flex flex-col gap-[16px]">
			{#each visibleDeals as deal (deal.id)}
				<li>
					<DealCard {deal} href={`/deals/${deal.id}`}>
						{#snippet actions()}
							{#if mySignatureOf(deal) === SignatureStates.Empty}
								<button
									type="button"
									onclick={onSignYes(deal)}
									class="bg-success text-default-inverse flex h-[24px] flex-1 items-center justify-center rounded-[5px] px-[12px] font-sans text-[10px] font-semibold transition-opacity hover:opacity-90"
								>
									{$i18n.deals.actions.confirm_completion}
								</button>
								<button
									type="button"
									onclick={onSignNo(deal)}
									class="bg-danger text-default-inverse flex h-[24px] flex-1 items-center justify-center rounded-[5px] px-[12px] font-sans text-[10px] font-semibold transition-opacity hover:opacity-90"
								>
									{$i18n.deals.actions.reject_completion}
								</button>
							{:else}
								<UploadCTA
									label="Choose files to upload"
									caption="Zip, Jpg or Pdf — Maximum files 10 MB"
								/>
							{/if}
						{/snippet}
					</DealCard>
				</li>
			{/each}
		</ul>
	{/if}
</Sheet>

<AppBottomNav />
