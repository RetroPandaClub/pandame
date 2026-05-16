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
	Aborted: 'Aborted',
	Disputed: 'Disputed',
	ArbitratedSettled: 'ArbitratedSettled',
	ArbitratedRefunded: 'ArbitratedRefunded'
} as const;

export type DealStatusName = (typeof DealStatuses)[keyof typeof DealStatuses];

/**
 * Terminal statuses — no further state transitions possible. Includes
 * the two arbitrated terminals introduced by the dispute-resolution
 * lifecycle (RFC-001) and `Aborted` from the v0.0.7 two-signature
 * tally (both parties signed `No` → refund to payer).
 */
export const TERMINAL_DEAL_STATUSES: readonly DealStatusName[] = [
	DealStatuses.Settled,
	DealStatuses.Refunded,
	DealStatuses.Cancelled,
	DealStatuses.Rejected,
	DealStatuses.Aborted,
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
 * Statuses that count as a "returned to payer" outcome. `Aborted`
 * (mutual two-signature `No`) lives here too — from the user's PoV
 * "both parties refused completion → refund" is the same bucket as
 * expiry-refund or arbitrated-refund.
 */
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

/**
 * Two-party settlement vote on a `Funded` bound deal. `Empty` is the
 * pre-sign default; once both parties have a non-empty signature the
 * canister tallies (`Yes`/`Yes` → `Settled`, `No`/`No` → `Aborted`,
 * mixed → auto-`Disputed`). Tip flows carry `Empty` forever — the
 * signing endpoints reject tips with `DisputeRequiresBoundRecipient`.
 */
export const SignatureStates = {
	Empty: 'Empty',
	Yes: 'Yes',
	No: 'No'
} as const;

export type SignatureState = (typeof SignatureStates)[keyof typeof SignatureStates];
