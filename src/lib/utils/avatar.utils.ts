import type { CanisterIdText } from '$lib/types/canister';

const DICEBEAR_STYLE = 'notionists';
const DICEBEAR_VERSION = '9.x';
const SEED_NAMESPACE = 'pandame';

// Non-crypto hash; its only job is to break the direct
// `principal -> avatar URL` correlation that DiceBear would otherwise
// see in plaintext. Sync + dep-free because we compose the URL inline.
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

export const dicebearAvatarUrl = (seed: string): string =>
	`https://api.dicebear.com/${DICEBEAR_VERSION}/${DICEBEAR_STYLE}/svg?seed=${encodeURIComponent(seed)}`;

// Principal is hashed before it leaves the device so DiceBear never
// sees it in the clear; the namespace prefix keeps the same principal
// from rendering identical artwork in unrelated sibling apps.
export const defaultAvatarUrlForPrincipal = (principal: CanisterIdText): string =>
	dicebearAvatarUrl(`${SEED_NAMESPACE}-${fnv1a64Hex(principal)}`);
