import {
	DisputeOutcomes,
	type DisputeOutcomeName,
	type DisputePhaseName,
	type VoteName
} from '$lib/enums/dispute';
import type {
	Dispute,
	DisputeOutcome,
	DisputePhase,
	DisputeTally,
	PublicDispute,
	Vote
} from '$lib/types/dispute';
import { variantKey } from '$lib/utils/variant.utils';
import { fromNullable } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';

export const disputePhase = (
	dispute: Pick<Dispute, 'phase'> | Pick<PublicDispute, 'phase'>
): DisputePhaseName =>
	variantKey<DisputePhaseName>(dispute.phase as Record<DisputePhaseName, unknown>);

export const phaseName = (phase: DisputePhase): DisputePhaseName =>
	variantKey<DisputePhaseName>(phase as Record<DisputePhaseName, unknown>);

export const voteName = (vote: Vote): VoteName =>
	variantKey<VoteName>(vote as Record<VoteName, unknown>);

/**
 * The discriminator key of a `DisputeOutcome` variant
 * (`Settled` / `Refunded` / `NoQuorum` / `Withdrawn`).
 */
export const outcomeName = (outcome: DisputeOutcome): DisputeOutcomeName =>
	variantKey<DisputeOutcomeName>(outcome as Record<DisputeOutcomeName, unknown>);

/**
 * Tally counts visible on a resolved dispute. `Withdrawn` outcomes
 * carry no tally — return `undefined` so callers can short-circuit
 * instead of pretending the panel voted 0/0/0.
 */
export const tallyOf = (outcome: DisputeOutcome): DisputeTally | undefined => {
	if ('Settled' in outcome) {
		return outcome.Settled;
	}
	if ('Refunded' in outcome) {
		return outcome.Refunded;
	}
	if ('NoQuorum' in outcome) {
		return outcome.NoQuorum;
	}
	return undefined;
};

/**
 * Vote agreed on by both parties when a dispute is `Withdrawn`,
 * `undefined` for any other outcome shape.
 */
export const withdrawnVote = (outcome: DisputeOutcome): Vote | undefined =>
	'Withdrawn' in outcome ? outcome.Withdrawn.agreed : undefined;

/**
 * Whether the given principal is a (currently-active) panel member on
 * this dispute. Used to gate the cast-vote / submit-evidence UI.
 */
export const isOnPanel = (
	dispute: Pick<Dispute, 'panel'>,
	principal: Principal | undefined
): boolean => {
	if (principal === undefined) {
		return false;
	}
	const text = principal.toText();
	return dispute.panel.some((member) => member.principal.toText() === text);
};

/**
 * The vote (if any) the given principal already cast on this dispute.
 * `undefined` covers both "not on the panel" and "on the panel but
 * hasn't voted yet".
 */
export const myVote = (
	dispute: Pick<Dispute, 'panel'>,
	principal: Principal | undefined
): Vote | undefined => {
	if (principal === undefined) {
		return undefined;
	}
	const text = principal.toText();
	const member = dispute.panel.find((m) => m.principal.toText() === text);
	if (member === undefined) {
		return undefined;
	}
	return fromNullable(member.vote);
};

/**
 * Vote helper constants — surfaced as values rather than constructed
 * inline at every call site to keep app code readable.
 */
export const VOTE_CC: Vote = { ConcludedCorrectly: null };
export const VOTE_IC: Vote = { IncorrectlyConcluded: null };
export const VOTE_ABSTAIN: Vote = { Abstain: null };

const VOTE_BY_NAME: Record<VoteName, Vote> = {
	ConcludedCorrectly: VOTE_CC,
	IncorrectlyConcluded: VOTE_IC,
	Abstain: VOTE_ABSTAIN
};

export const voteFromName = (name: VoteName): Vote => VOTE_BY_NAME[name];

/**
 * Whether `outcome` (when set) maps the underlying deal to its
 * "settled" terminal state — `Settled` / `Withdrawn(CC)`. Used by the
 * deal detail / card to colour the amount.
 */
export const isSettlingOutcome = (outcome: DisputeOutcome): boolean => {
	const name = outcomeName(outcome);
	if (name === DisputeOutcomes.Settled) {
		return true;
	}
	if (name === DisputeOutcomes.Withdrawn) {
		const agreed = withdrawnVote(outcome);
		return agreed !== undefined && voteName(agreed) === 'ConcludedCorrectly';
	}
	return false;
};
