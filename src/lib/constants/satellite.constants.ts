import { isDev } from '$lib/env/app.env';

/**
 * The satellite canister that stores this app's data and serves its assets.
 *
 * These are the same canisters as before the move off the Juno tooling — same
 * IDs, same custom domains, same stored data. This file replaces the
 * `satellite.ids` block of `juno.config.ts`, which the Juno Vite plugin used
 * to turn into a build-time define; canister IDs are public, so they stay in
 * version control rather than moving to an ignored `.env`.
 */
const SATELLITE_IDS = {
	development: 'auamu-4x777-77775-aaaaa-cai',
	production: 'wqhtf-fqaaa-aaaal-amssq-cai'
} as const;

/**
 * E2E runs against the `junobuild/satellite` emulator image, which bakes in a
 * predictable canister ID that is neither of the above. Tests set
 * `VITE_SATELLITE_ID` to point at it — see `docs/ai/frontend/testing.md`.
 */
export const SATELLITE_ID: string =
	import.meta.env.VITE_SATELLITE_ID ??
	(isDev() ? SATELLITE_IDS.development : SATELLITE_IDS.production);
