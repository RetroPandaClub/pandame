/**
 * Dispute lifecycle phases mirrored from the canister's `DisputePhase`
 * Candid variant. Keep this in sync with `$declarations/escrow/escrow.d.ts`.
 */
export const DisputePhases = {
	Evidence: 'Evidence',
	Voting: 'Voting',
	Resolved: 'Resolved'
} as const;

export type DisputePhaseName = (typeof DisputePhases)[keyof typeof DisputePhases];

/**
 * The three vote choices an arbitrator (or, for the withdraw flow, a
 * party) can pick. Mirrors the canister's `Vote` variant. `Abstain` is
 * rejected by the canister boundary for `withdraw_dispute` proposals
 * but valid for `cast_vote` from arbitrators.
 */
export const Votes = {
	ConcludedCorrectly: 'ConcludedCorrectly',
	IncorrectlyConcluded: 'IncorrectlyConcluded',
	Abstain: 'Abstain'
} as const;

export type VoteName = (typeof Votes)[keyof typeof Votes];

/**
 * Vote choices allowed for the out-of-band `withdraw_dispute` proposal —
 * `Abstain` is intentionally excluded (parties must agree on a verdict,
 * not on "no opinion").
 */
export const WITHDRAW_VOTES: readonly VoteName[] = [
	Votes.ConcludedCorrectly,
	Votes.IncorrectlyConcluded
];

/**
 * Discriminator keys of the canister's `DisputeOutcome` variant, exposed
 * here so the UI can switch on them without unwrapping the variant
 * shape directly.
 */
export const DisputeOutcomes = {
	Settled: 'Settled',
	Refunded: 'Refunded',
	NoQuorum: 'NoQuorum',
	Withdrawn: 'Withdrawn'
} as const;

export type DisputeOutcomeName = (typeof DisputeOutcomes)[keyof typeof DisputeOutcomes];
