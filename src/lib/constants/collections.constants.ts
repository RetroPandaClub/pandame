/**
 * Juno datastore collection names. Keep in sync with the
 * `satellite.collections.datastore` block in `juno.config.ts`, which
 * is applied to both the local emulator (`juno config apply --mode
 * development`) and the production satellite (`juno deploy`).
 */
export const Collection = {
	PROFILES: 'profiles'
} as const;

export type CollectionName = (typeof Collection)[keyof typeof Collection];
