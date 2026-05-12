import type { EscrowDid } from '$declarations';

/**
 * Re-exports of the canister's arbitrator types — keep app code free
 * of `$declarations` imports outside `$lib/{api,canisters}/`.
 */
export type Arbitrator = EscrowDid.ArbitratorProfile;
export type ArbitratorStatus = EscrowDid.ArbitratorStatus;
