import { defineConfig } from '@junobuild/config';

/**
 * Datastore collection names for `satellite.collections` below.
 *
 * Kept here (rather than imported from `./src/lib/constants/collections.constants.ts`)
 * because the Juno CLI evaluates this config in an isolated context where the SvelteKit
 * `$lib` alias is not resolvable. The app code still imports the same string values via
 * `Collection` in `$lib/constants/collections.constants.ts`; keep both in sync when
 * renaming or adding a collection.
 */
const enum JunoDatastoreCollection {
	PROFILES = 'profiles'
}

/**
 * The Juno CLI's `--emulator` flag is only valid with `--mode development`,
 * so E2E (which runs against the `junobuild/satellite` image) reuses
 * `mode === 'development'`. Callers that want to point the SDK at the
 * predictable satellite ID baked into the headless emulator image set
 * `JUNO_EMULATOR=true`, which swaps `ids.development` to that ID. The
 * default development ID matches the deterministic satellite created by
 * the local Skylab image on first `juno emulator start`.
 */
const isEmulator = process.env.JUNO_EMULATOR === 'true';

const EMULATOR_SATELLITE_ID = 'jx5yt-yyaaa-aaaal-abzbq-cai';
const LOCAL_SATELLITE_ID = 'auamu-4x777-77775-aaaaa-cai';

/**
 * Pandame uses Juno for two things only:
 *   1. Internet Identity sign-in.
 *   2. The `profiles` datastore (editable user metadata keyed by principal).
 *
 * All escrow / ledger state lives in the standalone Escrow Rust canister.
 *
 * The same `collections` block is applied to both the local emulator
 * (via `juno config apply --mode development`) and the production
 * satellite (via `juno deploy`), so there is no separate
 * `juno.dev.config.ts`.
 */
export default defineConfig({
	satellite: {
		ids: {
			development: isEmulator ? EMULATOR_SATELLITE_ID : LOCAL_SATELLITE_ID,
			production: 'wqhtf-fqaaa-aaaal-amssq-cai'
		},
		hosting: {
			source: 'build',
			predeploy: ['npm run build']
		},
		collections: {
			datastore: [
				{
					collection: JunoDatastoreCollection.PROFILES,
					memory: 'stable',
					// Profiles are public so other users can resolve a principal
					// to a nickname on history / claim screens. Only the owner
					// can mutate their own document (key === principal).
					read: 'public',
					write: 'private',
					mutablePermissions: true
				}
			]
		}
	},
	orbiter: {
		id: 'gfpjj-5iaaa-aaaal-amr4a-cai'
	},
	emulator: {
		runner: {
			type: 'docker'
		},
		satellite: {}
	}
});
