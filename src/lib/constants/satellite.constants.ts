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
 * `development` is the satellite the Skylab emulator (`juno emulator start`)
 * creates, which is what `npm run dev` and the local scripts target.
 *
 * The override exists for the other local setup: the standalone
 * `junobuild/satellite` image bakes in the fixed ID
 * `jx5yt-yyaaa-aaaal-abzbq-cai`. Nothing sets `VITE_SATELLITE_ID` today — the
 * E2E suite only exercises the homepage and never reaches the satellite — so
 * it is there for whoever runs against that image directly.
 */
export const SATELLITE_ID: string =
	import.meta.env.VITE_SATELLITE_ID ??
	(isDev() ? SATELLITE_IDS.development : SATELLITE_IDS.production);
