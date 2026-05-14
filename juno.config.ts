import { defineConfig } from '@junobuild/config';

/**
 * Datastore collection names for `satellite.collections` below.
 *
 * We keep them here instead of importing e.g. `./juno.collections.json`. Juno’s Docker-based
 * emulator/CLI often evaluates this config in an isolated context where extra project files
 * are not available or not bundled—importing external JSON can fail silently or break config load.
 * Track upstream: https://github.com/junobuild/juno-docker/issues/262
 *
 * The app still uses `juno.collections.json` via `Collection` in `src/lib`; keep both in sync when renaming.
 */
enum JunoDatastoreCollection {
	PROFILES = 'profiles'
}

/**
 * The Juno CLI's `--emulator` flag is only valid with `--mode development`,
 * so E2E (which runs against the `junobuild/satellite` image) must reuse
 * `mode === 'development'`. To avoid pointing the CLI at the *real* dev
 * satellite, callers (CI + local emulator workflows) export
 * `JUNO_EMULATOR=true`, which swaps `ids.development` to the predictable
 * satellite ID baked into the emulator image. See
 * `docs/ai/frontend/testing.md`.
 */
const isEmulator = process.env.JUNO_EMULATOR === 'true';

const EMULATOR_SATELLITE_ID = 'jx5yt-yyaaa-aaaal-abzbq-cai';

export default defineConfig(() => ({
	satellite: {
		ids: {
			development: isEmulator ? EMULATOR_SATELLITE_ID : 'auamu-4x777-77775-aaaaa-cai',
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
					read: 'public',
					write: 'public'
				}
			]
		}
	},
	emulator: {
		runner: {
			type: 'docker'
		},
		skylab: {}
	}
}));
