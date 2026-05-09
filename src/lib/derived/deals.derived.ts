import { DealStatuses } from '$lib/enums/deal-status';
import { dealsStore } from '$lib/stores/deals.store';
import { dealStatus, isTerminal } from '$lib/utils/deal.utils';
import { derived } from 'svelte/store';

export const dealsLoaded = derived(dealsStore, (deals) => deals !== undefined);

export const dealsCount = derived(dealsStore, (deals) => deals?.length ?? 0);

export const activeDeals = derived(
	dealsStore,
	(deals) => deals?.filter((deal) => !isTerminal(dealStatus(deal))) ?? []
);

export const settledDeals = derived(
	dealsStore,
	(deals) => deals?.filter((deal) => dealStatus(deal) === DealStatuses.Settled) ?? []
);

export const refundedDeals = derived(
	dealsStore,
	(deals) => deals?.filter((deal) => dealStatus(deal) === DealStatuses.Refunded) ?? []
);

export const cancelledDeals = derived(
	dealsStore,
	(deals) =>
		deals?.filter((deal) => {
			const status = dealStatus(deal);

			return status === DealStatuses.Cancelled || status === DealStatuses.Rejected;
		}) ?? []
);
