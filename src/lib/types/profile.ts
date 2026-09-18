import type { CanisterIdText } from '$lib/types/canister';

// Doc key is the owner's principal text so any caller can resolve a
// profile from just a principal. `avatar_url` is stored inline (either
// a DiceBear default URL or a small JPEG data URL) to avoid a second
// Juno collection; `fileToAvatarDataUrl` enforces the 2 MB doc limit.
export interface UserProfile {
	owner: CanisterIdText;
	username: string;
	name: string;
	surname: string;
	avatar_url?: string;
	/**
	 * The version this profile was read at, echoed back on write so a stale
	 * save is rejected rather than silently overwriting a newer one.
	 * `undefined` when the profile does not exist in the canister yet.
	 */
	version?: bigint;
}

// `avatar_url` is intentionally undefined here; `ensureProfile` is
// the single place that materialises and persists the default.
export const emptyProfile = (owner: CanisterIdText): UserProfile => ({
	owner,
	username: '',
	name: '',
	surname: ''
});
