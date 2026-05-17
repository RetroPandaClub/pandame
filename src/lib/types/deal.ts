import type { EscrowDid } from '$declarations';

// Re-exports keep app code free of `$declarations` imports outside `$lib/{api,canisters}/`.
export type Deal = EscrowDid.DealView;
export type ClaimableDeal = EscrowDid.ClaimableDealView;

export type DealError = EscrowDid.EscrowError;

export type DealStatusKey = keyof EscrowDid.DealStatus;
export type ConsentKey = keyof EscrowDid.Consent;
export type SignatureKey = keyof EscrowDid.Signature;

// `unknown` covers callers who aren't a party (e.g. public claim preview).
export type DealSide = 'payer' | 'recipient' | 'unknown';

// `settled` / `refunded` collapse their `Arbitrated…` counterparts —
// the user shouldn't have to know how the deal reached its terminal state.
export type DealFilter = 'all' | 'active' | 'settled' | 'refunded' | 'cancelled' | 'disputed';
