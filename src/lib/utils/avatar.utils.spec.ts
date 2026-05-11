import { defaultAvatarUrlForPrincipal, dicebearAvatarUrl } from '$lib/utils/avatar.utils';
import { describe, expect, it } from 'vitest';

describe('avatar.utils', () => {
	describe('dicebearAvatarUrl', () => {
		it('returns a versioned, styled DiceBear URL', () => {
			expect(dicebearAvatarUrl('hello')).toBe(
				'https://api.dicebear.com/9.x/notionists/svg?seed=hello'
			);
		});

		it('URL-encodes the seed so reserved characters survive the round trip', () => {
			expect(dicebearAvatarUrl('a b/c?d')).toBe(
				'https://api.dicebear.com/9.x/notionists/svg?seed=a%20b%2Fc%3Fd'
			);
		});
	});

	describe('defaultAvatarUrlForPrincipal', () => {
		const principal = 'aaaaa-bbbbb-ccccc-ddddd-eee';

		it('is deterministic for the same principal', () => {
			expect(defaultAvatarUrlForPrincipal(principal)).toBe(defaultAvatarUrlForPrincipal(principal));
		});

		it('differs across principals', () => {
			expect(defaultAvatarUrlForPrincipal('aaaaa-bbbbb-ccccc-ddddd-eee')).not.toBe(
				defaultAvatarUrlForPrincipal('aaaaa-bbbbb-ccccc-ddddd-eef')
			);
		});

		it('hashes the principal so the raw principal never appears in the URL', () => {
			const url = defaultAvatarUrlForPrincipal(principal);
			expect(url).not.toContain(principal);
		});

		it('namespaces the seed under "pandame-" so cross-app collisions are unlikely', () => {
			const url = defaultAvatarUrlForPrincipal(principal);
			expect(url).toMatch(/seed=pandame-[0-9a-f]{16}$/);
		});

		it('produces a stable URL for a known principal (regression guard)', () => {
			// Hash computed from the same FNV-1a 64-bit reference vector
			// the implementation uses; "foobar" -> 85944171f73967e8 in the
			// canonical FNV-1a 64-bit test vectors.
			expect(defaultAvatarUrlForPrincipal('test-principal')).toBe(
				'https://api.dicebear.com/9.x/notionists/svg?seed=pandame-cf4f33cc7cf6b2ca'
			);
		});
	});
});
