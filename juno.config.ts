import { defineConfig } from '@junobuild/config';

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

export default defineConfig({
	satellite: {
		ids: {
			development: isEmulator ? EMULATOR_SATELLITE_ID : LOCAL_SATELLITE_ID,
			production: 'wqhtf-fqaaa-aaaal-amssq-cai'
		},
		hosting: {
			source: 'build',
			predeploy: ['npm run build']
		}
	},
	orbiter: {
		id: 'gfpjj-5iaaa-aaaal-amr4a-cai'
	}
});
