import { isDev } from '$lib/env/app.env';

// Dev hits the Vite `/api` proxy → local replica; prod talks to the public
// boundary node.
export const REPLICA_HOST =
	isDev() && typeof window !== 'undefined' ? window.location.origin : 'https://icp-api.io';

export const ZERO = 0n;

// Time
export const SECOND_IN_MS = 1_000n;
export const MINUTE_IN_MS = 60n * SECOND_IN_MS;
export const HOUR_IN_MS = 60n * MINUTE_IN_MS;
export const DAY_IN_MS = 24n * HOUR_IN_MS;
export const WEEK_IN_MS = 7n * DAY_IN_MS;

export const MILLISECOND_IN_NANOSECONDS = 1_000_000n;
export const SECOND_IN_NANOSECONDS = 1_000_000_000n;
export const MINUTE_IN_NANOSECONDS = 60n * SECOND_IN_NANOSECONDS;
export const HOUR_IN_NANOSECONDS = 60n * MINUTE_IN_NANOSECONDS;
export const DAY_IN_NANOSECONDS = 24n * HOUR_IN_NANOSECONDS;
export const WEEK_IN_NANOSECONDS = 7n * DAY_IN_NANOSECONDS;

// Internet Identity
//
// The identity provider is the `@icp-sdk/auth` default, https://id.ai
// (Internet Identity 2.0) — the same one the Juno SDK defaulted to, so
// principals are unchanged. II 2.0 is also what provides One-Click sign-in
// with Google, Apple and Microsoft.

// Matches the session length the Juno SDK applied, so dropping it does not
// silently extend how long a delegation stays valid.
export const II_MAX_TIME_TO_LIVE_NS = 4n * HOUR_IN_NANOSECONDS;

// Popup dimensions II expects; the taller/narrower variant is what id.ai uses.
export const II_WINDOW_FEATURES = 'width=424,height=576';
