import { defineDevConfig } from '@junobuild/config';

/**
 * Datastore collection names. Keep in sync with
 * `src/lib/constants/collections.constants.ts`'s `Collection` enum and
 * with the production satellite's collection definitions (managed via
 * the Juno Console).
 */
const enum DatastoreCollection {
	PROFILES = 'profiles'
}

/**
 * Pandame uses Juno for Internet Identity sign-in + the user-profile
 * datastore. Persistent escrow state lives in the standalone Escrow
 * canister.
 */
export default defineDevConfig(() => ({
	satellite: {
		collections: {
			datastore: [
				{
					collection: DatastoreCollection.PROFILES,
					memory: 'stable' as const,
					// Profiles are public so other users can resolve a principal
					// to a nickname on history / claim screens. Only the owner
					// can mutate their own document (key === principal).
					read: 'public' as const,
					write: 'private' as const,
					mutablePermissions: true
				}
			],
			storage: []
		}
	}
}));
