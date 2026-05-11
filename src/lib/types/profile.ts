import type { CanisterIdText } from '$lib/types/canister';

/**
 * User-editable profile metadata stored in the Juno `profiles` datastore.
 * The document key is always the owner's principal text (so anyone with
 * a principal can resolve the matching profile).
 *
 * `avatar_url` is stored inline as a small JPEG data URL (center-cropped
 * + resized client-side in `$lib/utils/image.utils.ts`) so the avatar
 * round-trips with the rest of the profile and no separate Juno storage
 * collection is required. Keep the encoded payload well under the
 * collection's 2 MB doc limit — `fileToAvatarDataUrl` enforces this.
 */
export interface UserProfile {
	owner: CanisterIdText;
	username: string;
	name: string;
	surname: string;
	avatar_url?: string;
}

/**
 * Returns a fresh profile shell for the given principal.
 */
export const emptyProfile = (owner: CanisterIdText): UserProfile => ({
	owner,
	username: '',
	name: '',
	surname: ''
});
