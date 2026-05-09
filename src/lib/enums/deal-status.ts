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
	Rejected: 'Rejected'
} as const;

export type DealStatusName = (typeof DealStatuses)[keyof typeof DealStatuses];

/**
 * Terminal statuses — no further state transitions possible.
 */
export const TERMINAL_DEAL_STATUSES: readonly DealStatusName[] = [
	DealStatuses.Settled,
	DealStatuses.Refunded,
	DealStatuses.Cancelled,
	DealStatuses.Rejected
];

export const ConsentStates = {
	Pending: 'Pending',
	Accepted: 'Accepted',
	Rejected: 'Rejected'
} as const;

export type ConsentState = (typeof ConsentStates)[keyof typeof ConsentStates];
