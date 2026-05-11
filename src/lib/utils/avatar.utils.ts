import type { CanisterIdText } from '$lib/types/canister';

const DICEBEAR_STYLE = 'notionists';
const DICEBEAR_VERSION = '9.x';
const SEED_NAMESPACE = 'pandame';

/**
 * 64-bit FNV-1a hash, returned as a zero-padded 16-char hex string.
 *
 * Used to derive a deterministic DiceBear seed from the user's principal
 * without ever sending the raw principal to `api.dicebear.com`. FNV-1a is
 * fast, dependency-free and sync, which matters because the avatar URL
 * is composed at profile-creation time and may be recomputed during
 * `ensureProfile` for older profiles missing a default.
 *
 * This is **not** a cryptographic hash — it only needs to break the
 * direct `principal -> avatar URL` correlation that the third-party
 * image host would otherwise receive in plaintext.
 */
const fnv1a64Hex = (input: string): string => {
	const MASK = 0xffffffffffffffffn;
	const PRIME = 0x100000001b3n;
	let hash = 0xcbf29ce484222325n;

	for (let i = 0; i < input.length; i++) {
		hash ^= BigInt(input.charCodeAt(i));
		hash = (hash * PRIME) & MASK;
	}

	return hash.toString(16).padStart(16, '0');
};

/**
 * DiceBear URL for a given opaque seed. Kept in one place so every
 * surface in the app renders the same default avatar artwork for the
 * same seed.
 */
export const dicebearAvatarUrl = (seed: string): string =>
	`https://api.dicebear.com/${DICEBEAR_VERSION}/${DICEBEAR_STYLE}/svg?seed=${encodeURIComponent(seed)}`;

/**
 * Deterministic default avatar URL for the given principal. The seed is
 * derived from the principal alone — no extra randomness, no emoji, no
 * uploaded image — so the same principal always maps to the same avatar
 * and the result is stable across reloads, devices and clients.
 *
 * The principal is hashed before it reaches the DiceBear host so the raw
 * principal text never leaks to a third-party image CDN. The
 * `pandame-` namespace keeps the same principal from rendering the
 * same artwork in unrelated sibling apps.
 */
export const defaultAvatarUrlForPrincipal = (principal: CanisterIdText): string =>
	dicebearAvatarUrl(`${SEED_NAMESPACE}-${fnv1a64Hex(principal)}`);
