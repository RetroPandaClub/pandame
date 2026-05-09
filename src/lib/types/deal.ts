import type { EscrowDid } from '$declarations';

/**
 * Re-export of the canister's `DealView` to keep app code free of
 * `$declarations` imports outside `$lib/{api,canisters}/`.
 */
export type Deal = EscrowDid.DealView;

/**
 * Public claim view returned by `get_claimable_deal` — no payer, no
 * claim code, no internal fields.
 */
export type ClaimableDeal = EscrowDid.ClaimableDealView;

export type DealError = EscrowDid.EscrowError;

/**
 * Lifecycle status keys, narrowed to a string for switch/match ergonomics.
 */
export type DealStatusKey = keyof EscrowDid.DealStatus;
export type ConsentKey = keyof EscrowDid.Consent;

/**
 * Side of the deal a given principal is on. `unknown` covers the case
 * where the caller is neither party (e.g. a public claim preview).
 */
export type DealSide = 'payer' | 'recipient' | 'unknown';
