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
	import type { Deal, DealSide } from '$lib/types/deal';
	import { consentState, dealStatus, sideOf, signatureState } from '$lib/utils/deal.utils';

	type Tab = 'pending' | 'created' | 'disputed';

	const TABS: readonly Tab[] = ['pending', 'created', 'disputed'];

	const isTab = (value: string | null): value is Tab =>
		value !== null && (TABS as readonly string[]).includes(value);

	// Unrecognised values fall back to Pending so a stale link never throws.
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

	// Pending = the deal is waiting on me; Created = waiting on the
	// other side. Each side acts twice (consent, then sign), so both
	// gates feed both tabs.
	const matches = (deal: Deal, t: Tab): boolean => {
		const status = dealStatus(deal);
		const side: DealSide = sideOf(deal, principal);
		if (side === 'unknown') {
			return false;
		}

		const myConsent =
			side === 'payer' ? consentState(deal.payer_consent) : consentState(deal.recipient_consent);
		const theirConsent =
			side === 'payer' ? consentState(deal.recipient_consent) : consentState(deal.payer_consent);
		const mySig =
			side === 'payer'
				? signatureState(deal.payer_signature)
				: signatureState(deal.recipient_signature);
		const theirSig =
			side === 'payer'
				? signatureState(deal.recipient_signature)
				: signatureState(deal.payer_signature);

		switch (t) {
			case 'pending':
				if (status === DealStatuses.Created) {
					return myConsent === ConsentStates.Pending;
				}
				if (status === DealStatuses.Funded) {
					return mySig === SignatureStates.Empty;
				}
				return false;
			case 'created':
				if (status === DealStatuses.Created) {
					return myConsent === ConsentStates.Accepted && theirConsent === ConsentStates.Pending;
				}
				if (status === DealStatuses.Funded) {
					return mySig !== SignatureStates.Empty && theirSig === SignatureStates.Empty;
				}
				return false;
			case 'disputed':
				// Disputes render straight from `disputesStore`, not from this filter.
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

	// `accept_deal` traps on `Created` (it routes to `sign_yes`, which
	// needs a funded deal), so we split by lifecycle gate. Kept for the
	// public claim flow only.
	const approve = (deal: Deal) => async () => {
		const status = dealStatus(deal);
		try {
			if (status === DealStatuses.Created) {
				await consentDeal({ deal });
			} else if (status === DealStatuses.Funded) {
				await signYes({ dealId: deal.id });
			}
			await reloadDeals();
		} catch (err) {
			console.error('Failed to approve deal:', err);
		}
	};

	const decline = (deal: Deal) => async () => {
		const status = dealStatus(deal);
		try {
			if (status === DealStatuses.Created) {
				await rejectDeal({ dealId: deal.id });
			} else if (status === DealStatuses.Funded) {
				await signNo({ dealId: deal.id });
			}
			await reloadDeals();
		} catch (err) {
			console.error('Failed to decline deal:', err);
		}
	};

	const cancel = (deal: Deal) => async () => {
		try {
			await cancelDeal({ dealId: deal.id });
			await reloadDeals();
		} catch (err) {
			console.error('Failed to cancel deal:', err);
		}
	};

	// Cancel is only legal on `Created`; once Funded the equivalent is `sign_no`.
	const showInlineCancel = (deal: Deal): boolean => dealStatus(deal) === DealStatuses.Created;

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
								{#if showInlineCancel(deal)}
									<button
										type="button"
										onclick={cancel(deal)}
										class="bg-danger text-default-inverse flex h-[24px] w-[58px] items-center justify-center rounded-[5px] font-sans text-[10px] font-semibold transition-opacity hover:opacity-90"
									>
										{$i18n.deals.actions.cancel}
									</button>
								{:else}
									<UploadCTA
										label="Choose files to upload"
										caption="Zip, Jpg or Pdf — Maximum files 10 MB"
									/>
								{/if}
							{/snippet}
						</DealCard>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</Sheet>

<AppBottomNav />
