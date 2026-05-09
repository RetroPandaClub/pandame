import { isDev } from '$lib/env/app.env';

/**
 * The IC HTTP gateway. In dev we point the agent at the same origin as the
 * dev server (`window.location.origin`) and rely on Vite's `/api` proxy to
 * forward calls to the local Juno emulator's replica on `127.0.0.1:5987` —
 * the emulator does NOT proxy to mainnet, it is a self-contained local
 * replica. In production we hit the public boundary node directly. See
 * `vite.config.ts` for the proxy and `.agents/workflows/deployment.md` for
 * the full local-replica setup (escrow + ledger live in the same emulator).
 */
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

// Internet Identity session
export const II_MAX_TIME_TO_LIVE_NS = WEEK_IN_NANOSECONDS;
