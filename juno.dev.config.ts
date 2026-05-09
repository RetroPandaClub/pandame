import { defineDevConfig } from '@junobuild/config';

/**
 * Pandame uses Juno only for Internet Identity sign-in — all persistent
 * state lives in the standalone Escrow Rust canister. No datastore /
 * storage collections are required, but the dev config block stays to
 * keep `juno dev start` happy with an explicit (empty) collection list.
 */
export default defineDevConfig(() => ({
	satellite: {
		collections: {
			datastore: [],
			storage: []
		}
	}
}));
