/**
 * Arbitrator lifecycle status mirrored from the canister's
 * `ArbitratorStatus` Candid variant. Keep this in sync with
 * `$declarations/escrow/escrow.d.ts`.
 */
export const ArbitratorStatuses = {
	Active: 'Active',
	Suspended: 'Suspended',
	Deregistered: 'Deregistered'
} as const;

export type ArbitratorStatusName = (typeof ArbitratorStatuses)[keyof typeof ArbitratorStatuses];

/**
 * Statuses the canister considers eligible for new dispute panels —
 * Suspended / Deregistered profiles can still finish in-flight
 * assignments but won't be selected for new ones.
 */
export const ELIGIBLE_ARBITRATOR_STATUSES: readonly ArbitratorStatusName[] = [
	ArbitratorStatuses.Active
];
