import type { CanisterIdText } from '$lib/types/canister';

/**
 * User-editable profile metadata stored in the Juno `profiles` datastore.
 * The document key is always the owner's principal text (so anyone with
 * a principal can resolve the matching profile).
 *
 * `avatar_url` carries either of two shapes:
 *  - a deterministic DiceBear URL derived from the owner's principal
 *    (the default, set by `ensureProfile` on first sign-in — see
 *    `$lib/utils/avatar.utils.ts`), or
 *  - a small JPEG data URL produced by the upload pipeline in
 *    `$lib/utils/image.utils.ts` once the user picks a custom photo.
 *
 * Storing the avatar inline keeps the profile self-contained — no extra
 * Juno storage collection is required. Keep the encoded payload well
 * under the collection's 2 MB doc limit — `fileToAvatarDataUrl`
 * enforces this; the DiceBear URL is always a short HTTPS string.
 */
export interface UserProfile {
	owner: CanisterIdText;
	username: string;
	name: string;
	surname: string;
	avatar_url?: string;
}

/**
 * Returns a fresh profile shell for the given principal. The default
 * `avatar_url` is intentionally left undefined here so the shell stays
 * a pure value object; `ensureProfile` is the single place that
 * materialises the deterministic default avatar and persists it.
 */
export const emptyProfile = (owner: CanisterIdText): UserProfile => ({
	owner,
	username: '',
	name: '',
	surname: ''
});
