// Mirror of the canister's `DealStatus` Candid variant.
export const DealStatuses = {
	Created: 'Created',
	Funded: 'Funded',
	Settled: 'Settled',
	Refunded: 'Refunded',
	Cancelled: 'Cancelled',
	Rejected: 'Rejected',
	Aborted: 'Aborted',
	Disputed: 'Disputed',
	ArbitratedSettled: 'ArbitratedSettled',
	ArbitratedRefunded: 'ArbitratedRefunded'
} as const;

export type DealStatusName = (typeof DealStatuses)[keyof typeof DealStatuses];

// No further state transitions possible.
export const TERMINAL_DEAL_STATUSES: readonly DealStatusName[] = [
	DealStatuses.Settled,
	DealStatuses.Refunded,
	DealStatuses.Cancelled,
	DealStatuses.Rejected,
	DealStatuses.Aborted,
	DealStatuses.ArbitratedSettled,
	DealStatuses.ArbitratedRefunded
];

// "Released to recipient" bucket — drives card colour + success icon.
export const SETTLED_DEAL_STATUSES: readonly DealStatusName[] = [
	DealStatuses.Settled,
	DealStatuses.ArbitratedSettled
];

// "Returned to payer" bucket — `Aborted` (both parties signed `No`)
// reads the same to the user as expiry- or arbitrated-refund.
export const REFUNDED_DEAL_STATUSES: readonly DealStatusName[] = [
	DealStatuses.Refunded,
	DealStatuses.Aborted,
	DealStatuses.ArbitratedRefunded
];

export const ConsentStates = {
	Pending: 'Pending',
	Accepted: 'Accepted',
	Rejected: 'Rejected'
} as const;

export type ConsentState = (typeof ConsentStates)[keyof typeof ConsentStates];

// Two-party tally on a `Funded` bound deal: `Yes`/`Yes` → `Settled`,
// `No`/`No` → `Aborted`, mixed → auto-`Disputed`. Tips stay `Empty`.
export const SignatureStates = {
	Empty: 'Empty',
	Yes: 'Yes',
	No: 'No'
} as const;

export type SignatureState = (typeof SignatureStates)[keyof typeof SignatureStates];
