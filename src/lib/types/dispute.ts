import type { EscrowDid } from '$declarations';

/**
 * Re-exports of the canister's dispute types — keep app code free of
 * `$declarations` imports outside `$lib/{api,canisters}/`.
 */
export type Dispute = EscrowDid.DisputeView;
export type PublicDispute = EscrowDid.PublicDisputeView;
export type DisputeConfig = EscrowDid.DisputeConfig;
export type DisputeTally = EscrowDid.DisputeTally;
export type DisputeOutcome = EscrowDid.DisputeOutcome;
export type DisputePhase = EscrowDid.DisputePhase;
export type Vote = EscrowDid.Vote;
export type Evidence = EscrowDid.Evidence;
export type PanelMember = EscrowDid.PanelMember;

/**
 * Dispute-list filter narrowing — used by the Transactions "Disputed"
 * tab and any future arbitrator dashboard view.
 */
export type DisputeFilter = 'all' | 'evidence' | 'voting' | 'resolved';
