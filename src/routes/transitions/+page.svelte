<script lang="ts">
	import { Principal } from '@icp-sdk/core/principal';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import DealCard from '$lib/components/DealCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import Sheet from '$lib/components/Sheet.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import UploadCTA from '$lib/components/UploadCTA.svelte';
	import UserPrincipalBadge from '$lib/components/UserPrincipalBadge.svelte';
	import { dealsLoaded } from '$lib/derived/deals.derived';
	import { userPrincipalText } from '$lib/derived/user.derived';
	import { DealStatuses, ConsentStates } from '$lib/enums/deal-status';
	import { acceptDeal, listMyDeals, rejectDeal } from '$lib/services/deal.services';
	import { dealsStore } from '$lib/stores/deals.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Deal } from '$lib/types/deal';
	import { consentState, dealStatus, sideOf } from '$lib/utils/deal.utils';

	type Tab = 'pending' | 'created' | 'disputed';

	let tab: Tab = $state('pending');

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
				// No `Disputed` lifecycle state in the canister yet.
				return false;
		}
	};

	let visibleDeals = $derived(($dealsStore ?? []).filter((deal) => matches(deal, tab)));

	const reload = async () => {
		try {
			const deals = await listMyDeals();
			dealsStore.set(deals);
		} catch (err) {
			console.error('Failed to refresh transitions:', err);
		}
	};

	$effect(() => {
		reload();
	});

	const approve = (deal: Deal) => async () => {
		try {
			await acceptDeal({ dealId: deal.id });
			await reload();
		} catch (err) {
			console.error('Failed to approve deal:', err);
		}
	};

	const decline = (deal: Deal) => async () => {
		try {
			await rejectDeal({ dealId: deal.id });
			await reload();
		} catch (err) {
			console.error('Failed to decline deal:', err);
		}
	};

	let emptyDescription = $derived.by(() => {
		switch (tab) {
			case 'pending':
				return $i18n.transitions.empty_pending;
			case 'created':
				return $i18n.transitions.empty_created;
			case 'disputed':
				return $i18n.transitions.empty_disputed;
		}
	});
</script>

<svelte:head>
	<title>{$i18n.transitions.title} · {$i18n.layout.title}</title>
</svelte:head>

<svelte:window onjunoExampleReload={reload} />

<AuthGuard />

<BrandHeader title={$i18n.transitions.title}>
	{#snippet trailing()}
		<UserPrincipalBadge />
	{/snippet}

	<Tabs
		bind:value={tab}
		ariaLabel="Transition status"
		tabs={[
			{ id: 'pending', label: $i18n.transitions.tab_pending },
			{ id: 'created', label: $i18n.transitions.tab_created },
			{ id: 'disputed', label: $i18n.transitions.tab_disputed, disabled: true }
		]}
	/>
</BrandHeader>

<Sheet paddingClass="px-[19px] pt-[26px] pb-[120px]" class="gap-[16px]">
	{#if !$dealsLoaded}
		<p class="text-body2 text-muted" aria-live="polite">{$i18n.core.text.loading}</p>
	{:else if visibleDeals.length === 0}
		<EmptyState title={$i18n.transitions.empty_title} description={emptyDescription} />
	{:else}
		<ul class="flex flex-col gap-[16px]">
			{#each visibleDeals as deal (deal.id)}
				<li>
					{#if tab === 'pending'}
						<DealCard {deal} href={`/deals/${deal.id}`}>
							{#snippet actions()}
								<button
									type="button"
									onclick={approve(deal)}
									class="bg-success text-default-inverse rounded-button h-[31px] px-[18px] font-sans text-[12px] font-semibold transition-opacity hover:opacity-90"
								>
									{$i18n.deals.actions.consent}
								</button>
								<button
									type="button"
									onclick={decline(deal)}
									class="bg-danger text-default-inverse rounded-button h-[31px] px-[18px] font-sans text-[12px] font-semibold transition-opacity hover:opacity-90"
								>
									{$i18n.deals.actions.reject}
								</button>
							{/snippet}
						</DealCard>
					{:else if tab === 'created'}
						<DealCard {deal} href={`/deals/${deal.id}`}>
							{#snippet actions()}
								<UploadCTA
									label="Choose files to upload"
									caption="Zip, Jpg or Pdf — Maximum files 10 MB"
								/>
							{/snippet}
						</DealCard>
					{:else}
						<DealCard {deal} href={`/deals/${deal.id}`} />
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</Sheet>

<AppBottomNav />
