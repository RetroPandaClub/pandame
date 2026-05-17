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

export const outcomeName = (outcome: DisputeOutcome): DisputeOutcomeName =>
	variantKey<DisputeOutcomeName>(outcome as Record<DisputeOutcomeName, unknown>);

// `Withdrawn` carries no tally; return `undefined` rather than a fake 0/0/0.
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

export const withdrawnVote = (outcome: DisputeOutcome): Vote | undefined =>
	'Withdrawn' in outcome ? outcome.Withdrawn.agreed : undefined;

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

// `undefined` covers both "not on the panel" and "on the panel but hasn't voted yet".
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

export const VOTE_CC: Vote = { ConcludedCorrectly: null };
export const VOTE_IC: Vote = { IncorrectlyConcluded: null };
export const VOTE_ABSTAIN: Vote = { Abstain: null };

const VOTE_BY_NAME: Record<VoteName, Vote> = {
	ConcludedCorrectly: VOTE_CC,
	IncorrectlyConcluded: VOTE_IC,
	Abstain: VOTE_ABSTAIN
};

export const voteFromName = (name: VoteName): Vote => VOTE_BY_NAME[name];

// True iff the outcome releases funds to the recipient
// (`Settled`, or `Withdrawn(ConcludedCorrectly)`).
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
