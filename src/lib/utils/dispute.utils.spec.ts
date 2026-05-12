import type { Dispute, DisputeOutcome } from '$lib/types/dispute';
import {
	disputePhase,
	isOnPanel,
	isSettlingOutcome,
	myVote,
	outcomeName,
	phaseName,
	tallyOf,
	VOTE_ABSTAIN,
	VOTE_CC,
	VOTE_IC,
	voteFromName,
	voteName,
	withdrawnVote
} from '$lib/utils/dispute.utils';
import { Principal } from '@icp-sdk/core/principal';
import { describe, expect, it } from 'vitest';

const PRINCIPAL_A = Principal.fromText('aaaaa-aa');
const PRINCIPAL_B = Principal.fromText('2vxsx-fae');

const TALLY_3_2_0 = { cc: 3, ic: 2, abstain: 0 };

const baseDispute = (overrides: Partial<Dispute> = {}): Dispute => ({
	id: 1n,
	deal_id: 7n,
	opened_by: PRINCIPAL_A,
	opened_at_ns: 0n,
	evidence_deadline_ns: 100n,
	voting_deadline_ns: 200n,
	arbitration_fee: 0n,
	phase: { Evidence: null },
	evidence: [],
	panel: [],
	payer_withdraw_proposal: [],
	recipient_withdraw_proposal: [],
	outcome: [],
	...overrides
});

describe('dispute.utils', () => {
	describe('phase / vote name unwrappers', () => {
		it('extracts the phase discriminator', () => {
			expect(disputePhase(baseDispute({ phase: { Evidence: null } }))).toBe('Evidence');
			expect(disputePhase(baseDispute({ phase: { Voting: null } }))).toBe('Voting');
			expect(disputePhase(baseDispute({ phase: { Resolved: null } }))).toBe('Resolved');
		});

		it('extracts a phase variant key directly', () => {
			expect(phaseName({ Voting: null })).toBe('Voting');
		});

		it('extracts a vote variant key', () => {
			expect(voteName({ ConcludedCorrectly: null })).toBe('ConcludedCorrectly');
			expect(voteName({ IncorrectlyConcluded: null })).toBe('IncorrectlyConcluded');
			expect(voteName({ Abstain: null })).toBe('Abstain');
		});

		it('round-trips vote names back to variants', () => {
			expect(voteFromName('ConcludedCorrectly')).toEqual(VOTE_CC);
			expect(voteFromName('IncorrectlyConcluded')).toEqual(VOTE_IC);
			expect(voteFromName('Abstain')).toEqual(VOTE_ABSTAIN);
		});
	});

	describe('outcome helpers', () => {
		it('returns the outcome discriminator', () => {
			const settled: DisputeOutcome = { Settled: TALLY_3_2_0 };
			const refunded: DisputeOutcome = { Refunded: TALLY_3_2_0 };
			const noQuorum: DisputeOutcome = { NoQuorum: TALLY_3_2_0 };
			const withdrawn: DisputeOutcome = { Withdrawn: { agreed: { ConcludedCorrectly: null } } };

			expect(outcomeName(settled)).toBe('Settled');
			expect(outcomeName(refunded)).toBe('Refunded');
			expect(outcomeName(noQuorum)).toBe('NoQuorum');
			expect(outcomeName(withdrawn)).toBe('Withdrawn');
		});

		it('returns the tally for non-Withdrawn outcomes', () => {
			expect(tallyOf({ Settled: TALLY_3_2_0 })).toEqual(TALLY_3_2_0);
			expect(tallyOf({ Refunded: TALLY_3_2_0 })).toEqual(TALLY_3_2_0);
			expect(tallyOf({ NoQuorum: TALLY_3_2_0 })).toEqual(TALLY_3_2_0);
			expect(tallyOf({ Withdrawn: { agreed: { ConcludedCorrectly: null } } })).toBeUndefined();
		});

		it('returns the agreed vote only for Withdrawn outcomes', () => {
			expect(withdrawnVote({ Withdrawn: { agreed: { ConcludedCorrectly: null } } })).toEqual(
				VOTE_CC
			);
			expect(withdrawnVote({ Settled: TALLY_3_2_0 })).toBeUndefined();
		});

		it('classifies settling outcomes (Settled, Withdrawn(CC))', () => {
			expect(isSettlingOutcome({ Settled: TALLY_3_2_0 })).toBe(true);
			expect(isSettlingOutcome({ Withdrawn: { agreed: { ConcludedCorrectly: null } } })).toBe(true);

			expect(isSettlingOutcome({ Refunded: TALLY_3_2_0 })).toBe(false);
			expect(isSettlingOutcome({ NoQuorum: TALLY_3_2_0 })).toBe(false);
			expect(isSettlingOutcome({ Withdrawn: { agreed: { IncorrectlyConcluded: null } } })).toBe(
				false
			);
		});
	});

	describe('panel queries', () => {
		const dispute = baseDispute({
			panel: [
				{
					principal: PRINCIPAL_A,
					vote: [{ ConcludedCorrectly: null }],
					paid_at_ns: [],
					payout_tx: []
				},
				{ principal: PRINCIPAL_B, vote: [], paid_at_ns: [], payout_tx: [] }
			]
		});

		it('detects panel membership by principal text', () => {
			expect(isOnPanel(dispute, PRINCIPAL_A)).toBe(true);
			expect(isOnPanel(dispute, PRINCIPAL_B)).toBe(true);
			expect(isOnPanel(dispute, undefined)).toBe(false);
		});

		it('returns the cast vote for a panel member', () => {
			expect(myVote(dispute, PRINCIPAL_A)).toEqual(VOTE_CC);
			expect(myVote(dispute, PRINCIPAL_B)).toBeUndefined();
			expect(myVote(dispute, undefined)).toBeUndefined();
		});
	});
});
