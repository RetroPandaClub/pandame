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
	import { ConsentStates, DealStatuses } from '$lib/enums/deal-status';
	import { acceptDeal, listMyDeals, rejectDeal } from '$lib/services/deal.services';
	import { listMyDisputes } from '$lib/services/dispute.services';
	import { dealsStore } from '$lib/stores/deals.store';
	import { disputesStore } from '$lib/stores/disputes.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Deal } from '$lib/types/deal';
	import { consentState, dealStatus, sideOf } from '$lib/utils/deal.utils';

	type Tab = 'pending' | 'created' | 'disputed';

	const TABS: readonly Tab[] = ['pending', 'created', 'disputed'];

	const isTab = (value: string | null): value is Tab =>
		value !== null && (TABS as readonly string[]).includes(value);

	// `?tab=` is the contract used by the home chatbot's "See Deal"
	// branch (Figma 219:306). Anything we don't recognise falls back
	// to the default Pending view rather than throwing.
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

	const matches = (deal: Deal, t: Tab): boolean => {
		const status = dealStatus(deal);
		switch (t) {
			case 'pending': {
				// "Pending" = funded, waiting on the caller's consent.
				if (status !== DealStatuses.Funded) {
					return false;
				}
				const side = sideOf(deal, principal);
				if (side === 'unknown') {
					return false;
				}
				const myConsent =
					side === 'payer'
						? consentState(deal.payer_consent)
						: consentState(deal.recipient_consent);
				return myConsent === ConsentStates.Pending;
			}
			case 'created':
				// "Created" = funded but the OTHER side hasn't acted yet —
				// the caller is waiting on someone else.
				return status === DealStatuses.Funded || status === DealStatuses.Created;
			case 'disputed':
				// Live disputes come from `list_my_disputes` (rendered
				// directly from `disputesStore`); the deal-side filter
				// below is unused for this tab.
				return false;
		}
	};

	let visibleDeals = $derived(($dealsStore ?? []).filter((deal) => matches(deal, tab)));
	let visibleDisputes = $derived($disputesStore ?? []);

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

	const approve = (deal: Deal) => async () => {
		try {
			await acceptDeal({ dealId: deal.id });
			await reloadDeals();
		} catch (err) {
			console.error('Failed to approve deal:', err);
		}
	};

	const decline = (deal: Deal) => async () => {
		try {
			await rejectDeal({ dealId: deal.id });
			await reloadDeals();
		} catch (err) {
			console.error('Failed to decline deal:', err);
		}
	};

	let emptyDescription = $derived.by(() => {
		switch (tab) {
			case 'pending':
				return $i18n.transactions.empty_pending;
			case 'created':
				return $i18n.transactions.empty_created;
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
			{ id: 'created', label: $i18n.transactions.tab_created },
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
	{:else}
		<ul class="flex flex-col gap-[16px]">
			{#each visibleDeals as deal (deal.id)}
				<li>
					{#if tab === 'pending'}
						<DealCard {deal} href={`/deals/${deal.id}`} showPanelSize>
							{#snippet actions()}
								<button
									type="button"
									onclick={approve(deal)}
									class="bg-success text-default-inverse flex h-[24px] w-[58px] items-center justify-center rounded-[5px] font-sans text-[10px] font-semibold transition-opacity hover:opacity-90"
								>
									{$i18n.deals.actions.consent}
								</button>
								<button
									type="button"
									onclick={decline(deal)}
									class="bg-danger text-default-inverse flex h-[24px] w-[58px] items-center justify-center rounded-[5px] font-sans text-[10px] font-semibold transition-opacity hover:opacity-90"
								>
									{$i18n.deals.actions.reject}
								</button>
							{/snippet}
						</DealCard>
					{:else}
						<DealCard {deal} href={`/deals/${deal.id}`}>
							{#snippet actions()}
								<UploadCTA
									label="Choose files to upload"
									caption="Zip, Jpg or Pdf — Maximum files 10 MB"
								/>
							{/snippet}
						</DealCard>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</Sheet>

<AppBottomNav />
