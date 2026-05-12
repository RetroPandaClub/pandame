<script lang="ts">
	import DealCard from '$lib/components/DealCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { dealsLoaded } from '$lib/derived/deals.derived';
	import {
		DealStatuses,
		REFUNDED_DEAL_STATUSES,
		SETTLED_DEAL_STATUSES
	} from '$lib/enums/deal-status';
	import { dealsStore } from '$lib/stores/deals.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Deal, DealFilter } from '$lib/types/deal';
	import { dealStatus, isTerminal } from '$lib/utils/deal.utils';

	interface Props {
		filter?: DealFilter;
	}

	let { filter = 'all' }: Props = $props();

	const matches = (deal: Deal, f: DealFilter): boolean => {
		const status = dealStatus(deal);

		switch (f) {
			case 'all':
				return true;
			case 'active':
				return !isTerminal(status);
			case 'settled':
				// Collapse `Settled` + `ArbitratedSettled` — both mean
				// "funds released to recipient" from the user's PoV.
				return SETTLED_DEAL_STATUSES.includes(status);
			case 'refunded':
				// Collapse `Refunded` + `ArbitratedRefunded` (incl. the
				// no-quorum fallback) — both mean "funds back to payer".
				return REFUNDED_DEAL_STATUSES.includes(status);
			case 'cancelled':
				return status === DealStatuses.Cancelled || status === DealStatuses.Rejected;
			case 'disputed':
				return status === DealStatuses.Disputed;
		}
	};

	let visibleDeals = $derived(($dealsStore ?? []).filter((deal) => matches(deal, filter)));
</script>

<section class="flex flex-col gap-3" aria-label="Your deals">
	{#if !$dealsLoaded}
		<p class="text-body2 text-muted" aria-live="polite">{$i18n.core.text.loading}</p>
	{:else if visibleDeals.length === 0}
		<EmptyState title={$i18n.deals.empty_title} description={$i18n.deals.empty_description} />
	{:else}
		<ul class="flex flex-col gap-3">
			{#each visibleDeals as deal (deal.id)}
				<li>
					<DealCard {deal} href={`/deals/${deal.id}`} />
				</li>
			{/each}
		</ul>
	{/if}
</section>
