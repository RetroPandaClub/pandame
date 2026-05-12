import {
	ConsentStates,
	TERMINAL_DEAL_STATUSES,
	type ConsentState,
	type DealStatusName
} from '$lib/enums/deal-status';
import type { ClaimableDeal, ConsentKey, Deal, DealSide, DealStatusKey } from '$lib/types/deal';
import { variantKey } from '$lib/utils/variant.utils';
import { fromNullable } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';

export const dealStatus = (
	deal: Pick<Deal, 'status'> | Pick<ClaimableDeal, 'status'>
): DealStatusName => variantKey<DealStatusKey>(deal.status) as DealStatusName;

export const consentState = (consent: Deal['payer_consent']): ConsentState =>
	variantKey<ConsentKey>(consent) as ConsentState;

export const isTerminal = (status: DealStatusName): boolean =>
	TERMINAL_DEAL_STATUSES.includes(status);

export const isExpired = (deal: Pick<Deal, 'expires_at_ns'>, nowNs: bigint): boolean =>
	deal.expires_at_ns <= nowNs;

/**
 * Which side of the deal is `principal` on? Returns `'unknown'` when the
 * principal matches neither party — used by the public claim preview.
 */
export const sideOf = (
	deal: Pick<Deal, 'payer' | 'recipient'>,
	principal: Principal | undefined
): DealSide => {
	if (principal === undefined) {
		return 'unknown';
	}

	const payer = fromNullable(deal.payer);
	const recipient = fromNullable(deal.recipient);

	if (payer?.toText() === principal.toText()) {
		return 'payer';
	}

	if (recipient?.toText() === principal.toText()) {
		return 'recipient';
	}

	return 'unknown';
};

/**
 * Whether both parties have explicitly accepted the deal terms.
 */
export const isFullyConsented = (
	deal: Pick<Deal, 'payer_consent' | 'recipient_consent'>
): boolean =>
	consentState(deal.payer_consent) === ConsentStates.Accepted &&
	consentState(deal.recipient_consent) === ConsentStates.Accepted;
