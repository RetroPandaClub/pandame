import { ConsentStates, DealStatuses, SignatureStates } from '$lib/enums/deal-status';
import { dealsStore } from '$lib/stores/deals.store';
import { userStore } from '$lib/stores/user.store';
import type { Deal } from '$lib/types/deal';
import {
	consentState,
	dealStatus,
	isTerminal,
	sideOf,
	signatureState
} from '$lib/utils/deal.utils';
import { Principal } from '@icp-sdk/core/principal';
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

const needsMyAction = (deal: Deal, principal: Principal): boolean => {
	const side = sideOf(deal, principal);
	if (side === 'unknown') {
		return false;
	}

	const status = dealStatus(deal);

	if (status === DealStatuses.Created) {
		const consent =
			side === 'payer' ? consentState(deal.payer_consent) : consentState(deal.recipient_consent);
		return consent === ConsentStates.Pending;
	}

	if (status === DealStatuses.Funded) {
		const signature =
			side === 'payer'
				? signatureState(deal.payer_signature)
				: signatureState(deal.recipient_signature);
		return signature === SignatureStates.Empty;
	}

	return false;
};

export const dealsAttentionCount = derived([dealsStore, userStore], ([deals, user]) => {
	if (deals === undefined || user === null || user === undefined) {
		return 0;
	}

	let principal: Principal;
	try {
		principal = Principal.fromText(user.key);
	} catch {
		return 0;
	}

	return deals.reduce((acc, deal) => (needsMyAction(deal, principal) ? acc + 1 : acc), 0);
});
