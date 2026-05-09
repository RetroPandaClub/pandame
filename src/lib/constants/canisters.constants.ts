import { Principal } from '@icp-sdk/core/principal';

/**
 * Standalone Escrow Rust canister (mainnet, "staging" subnet).
 *
 * Source of truth: `../escrow/canister_ids.json`. Bump in lockstep with the
 * upstream repo.
 */
export const ESCROW_CANISTER_ID = Principal.fromText('umxj5-niaaa-aaaae-af2sq-cai');

/**
 * ICP ledger (NNS, mainnet). The default settlement token for v1.
 */
export const ICP_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';
