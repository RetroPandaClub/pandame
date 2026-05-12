/**
 * Deal status keys mirrored from the canister's `DealStatus` Candid variant.
 * Keep this in sync with `$declarations/escrow/escrow.d.ts`.
 */
export const DealStatuses = {
	Created: 'Created',
	Funded: 'Funded',
	Settled: 'Settled',
	Refunded: 'Refunded',
	Cancelled: 'Cancelled',
	Rejected: 'Rejected',
	Disputed: 'Disputed',
	ArbitratedSettled: 'ArbitratedSettled',
	ArbitratedRefunded: 'ArbitratedRefunded'
} as const;

export type DealStatusName = (typeof DealStatuses)[keyof typeof DealStatuses];

/**
 * Terminal statuses — no further state transitions possible. Includes
 * the two arbitrated terminals introduced by the dispute-resolution
 * lifecycle (RFC-001).
 */
export const TERMINAL_DEAL_STATUSES: readonly DealStatusName[] = [
	DealStatuses.Settled,
	DealStatuses.Refunded,
	DealStatuses.Cancelled,
	DealStatuses.Rejected,
	DealStatuses.ArbitratedSettled,
	DealStatuses.ArbitratedRefunded
];

/**
 * Statuses that count as a "released to recipient" outcome — used by the
 * UI to colour the deal-card amount + pick the success status icon.
 */
export const SETTLED_DEAL_STATUSES: readonly DealStatusName[] = [
	DealStatuses.Settled,
	DealStatuses.ArbitratedSettled
];

/**
 * Statuses that count as a "returned to payer" outcome.
 */
export const REFUNDED_DEAL_STATUSES: readonly DealStatusName[] = [
	DealStatuses.Refunded,
	DealStatuses.ArbitratedRefunded
];

export const ConsentStates = {
	Pending: 'Pending',
	Accepted: 'Accepted',
	Rejected: 'Rejected'
} as const;

export type ConsentState = (typeof ConsentStates)[keyof typeof ConsentStates];
