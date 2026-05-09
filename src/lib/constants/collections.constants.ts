/**
 * Juno datastore collection names. Keep in sync with the
 * `juno.dev.config.ts` definition (local emulator) and the production
 * satellite's collection list (managed via the Juno Console).
 */
export const Collection = {
	PROFILES: 'profiles'
} as const;

export type CollectionName = (typeof Collection)[keyof typeof Collection];
