// Mirror of the canister's `DisputePhase` Candid variant.
export const DisputePhases = {
	Evidence: 'Evidence',
	Voting: 'Voting',
	Resolved: 'Resolved'
} as const;

export type DisputePhaseName = (typeof DisputePhases)[keyof typeof DisputePhases];

// `Abstain` is valid for `cast_vote` but rejected by `withdraw_dispute`.
export const Votes = {
	ConcludedCorrectly: 'ConcludedCorrectly',
	IncorrectlyConcluded: 'IncorrectlyConcluded',
	Abstain: 'Abstain'
} as const;

export type VoteName = (typeof Votes)[keyof typeof Votes];

// `Abstain` excluded: parties must agree on a verdict, not "no opinion".
export const WITHDRAW_VOTES: readonly VoteName[] = [
	Votes.ConcludedCorrectly,
	Votes.IncorrectlyConcluded
];

// Keys of the canister's `DisputeOutcome` variant, so the UI can switch
// without unwrapping the variant shape.
export const DisputeOutcomes = {
	Settled: 'Settled',
	Refunded: 'Refunded',
	NoQuorum: 'NoQuorum',
	Withdrawn: 'Withdrawn'
} as const;

export type DisputeOutcomeName = (typeof DisputeOutcomes)[keyof typeof DisputeOutcomes];
