import { decodeDocData, encodeDocData } from '$lib/utils/doc-data.utils';
import { Principal } from '@icp-sdk/core/principal';
import { describe, expect, it } from 'vitest';

/**
 * These bytes were produced by `toArray` from `@junobuild/utils`, the encoder
 * that wrote every document currently stored in the satellite.
 *
 * Documents written before the move off the Juno SDK must stay readable, and
 * documents written after it must stay byte-identical to what the old client
 * produced — otherwise the two encodings diverge silently and only surface as
 * unreadable profiles in production. Pinning the exact bytes is what makes a
 * regression here fail in CI instead.
 */
const JUNO_ENCODED: [string, number[]][] = [
	[
		'a profile document',
		[
			123, 34, 111, 119, 110, 101, 114, 34, 58, 34, 97, 97, 97, 97, 97, 45, 97, 97, 34, 44, 34, 117,
			115, 101, 114, 110, 97, 109, 101, 34, 58, 34, 97, 100, 97, 34, 44, 34, 110, 97, 109, 101, 34,
			58, 34, 65, 100, 97, 34, 44, 34, 115, 117, 114, 110, 97, 109, 101, 34, 58, 34, 76, 34, 44, 34,
			97, 118, 97, 116, 97, 114, 95, 117, 114, 108, 34, 58, 34, 104, 116, 116, 112, 115, 58, 47, 47,
			120, 47, 121, 46, 115, 118, 103, 34, 125
		]
	],
	[
		'nested objects, null and booleans',
		[
			123, 34, 97, 34, 58, 123, 34, 98, 34, 58, 123, 34, 99, 34, 58, 91, 49, 44, 50, 44, 51, 93,
			125, 125, 44, 34, 110, 105, 108, 34, 58, 110, 117, 108, 108, 44, 34, 116, 34, 58, 116, 114,
			117, 101, 125
		]
	],
	[
		'bigint, including u64 max and negatives',
		[
			123, 34, 118, 101, 114, 115, 105, 111, 110, 34, 58, 123, 34, 95, 95, 98, 105, 103, 105, 110,
			116, 95, 95, 34, 58, 34, 52, 50, 34, 125, 44, 34, 98, 105, 103, 34, 58, 123, 34, 95, 95, 98,
			105, 103, 105, 110, 116, 95, 95, 34, 58, 34, 49, 56, 52, 52, 54, 55, 52, 52, 48, 55, 51, 55,
			48, 57, 53, 53, 49, 54, 49, 53, 34, 125, 44, 34, 110, 101, 103, 34, 58, 123, 34, 95, 95, 98,
			105, 103, 105, 110, 116, 95, 95, 34, 58, 34, 45, 55, 34, 125, 125
		]
	],
	[
		'a Principal',
		[
			123, 34, 111, 119, 110, 101, 114, 34, 58, 123, 34, 95, 95, 112, 114, 105, 110, 99, 105, 112,
			97, 108, 95, 95, 34, 58, 34, 119, 113, 104, 116, 102, 45, 102, 113, 97, 97, 97, 45, 97, 97,
			97, 97, 108, 45, 97, 109, 115, 115, 113, 45, 99, 97, 105, 34, 125, 125
		]
	],
	[
		'a Uint8Array',
		[
			123, 34, 98, 108, 111, 98, 34, 58, 123, 34, 95, 95, 117, 105, 110, 116, 56, 97, 114, 114, 97,
			121, 95, 95, 34, 58, 91, 48, 44, 49, 44, 49, 50, 55, 44, 49, 50, 56, 44, 50, 53, 53, 93, 125,
			125
		]
	],
	[
		'unicode, emoji and escapes',
		[
			123, 34, 115, 34, 58, 34, 104, 195, 169, 108, 108, 111, 32, 226, 128, 148, 32, 195, 188, 110,
			195, 175, 99, 111, 100, 101, 32, 240, 159, 144, 188, 32, 230, 151, 165, 230, 156, 172, 232,
			170, 158, 34, 44, 34, 113, 117, 111, 116, 101, 34, 58, 34, 92, 34, 92, 92, 47, 92, 110, 92,
			116, 34, 125
		]
	],
	['an empty object', [123, 125]],
	[
		'an array at the root',
		[
			91, 49, 44, 34, 116, 119, 111, 34, 44, 123, 34, 95, 95, 98, 105, 103, 105, 110, 116, 95, 95,
			34, 58, 34, 51, 34, 125, 93
		]
	],
	[
		'the three special types nested in an array',
		[
			123, 34, 108, 105, 115, 116, 34, 58, 91, 123, 34, 112, 34, 58, 123, 34, 95, 95, 112, 114, 105,
			110, 99, 105, 112, 97, 108, 95, 95, 34, 58, 34, 97, 97, 97, 97, 97, 45, 97, 97, 34, 125, 44,
			34, 118, 34, 58, 123, 34, 95, 95, 98, 105, 103, 105, 110, 116, 95, 95, 34, 58, 34, 49, 34,
			125, 44, 34, 98, 34, 58, 123, 34, 95, 95, 117, 105, 110, 116, 56, 97, 114, 114, 97, 121, 95,
			95, 34, 58, 91, 57, 93, 125, 125, 93, 125
		]
	]
];

const VALUES: Record<string, unknown> = {
	'a profile document': {
		owner: 'aaaaa-aa',
		username: 'ada',
		name: 'Ada',
		surname: 'L',
		avatar_url: 'https://x/y.svg'
	},
	'nested objects, null and booleans': {
		a: { b: { c: [1, 2, 3] } },
		missing: undefined,
		nil: null,
		t: true
	},
	'bigint, including u64 max and negatives': {
		version: 42n,
		big: 18446744073709551615n,
		neg: -7n
	},
	'a Principal': { owner: Principal.fromText('wqhtf-fqaaa-aaaal-amssq-cai') },
	'a Uint8Array': { blob: new Uint8Array([0, 1, 127, 128, 255]) },
	'unicode, emoji and escapes': { s: 'héllo — ünïcode 🐼 日本語', quote: '"\\/\n\t' },
	'an empty object': {},
	'an array at the root': [1, 'two', 3n],
	'the three special types nested in an array': {
		list: [{ p: Principal.fromText('aaaaa-aa'), v: 1n, b: new Uint8Array([9]) }]
	}
};

describe('doc-data.utils', () => {
	describe('encodeDocData matches the bytes the Juno SDK wrote', () => {
		it.each(JUNO_ENCODED)('encodes %s identically', (name, expected) => {
			expect(Array.from(encodeDocData(VALUES[name]))).toEqual(expected);
		});
	});

	describe('decodeDocData reads documents the Juno SDK wrote', () => {
		it.each(JUNO_ENCODED)('decodes %s', (name, bytes) => {
			// `undefined` members are dropped by JSON on the way out, so compare
			// against the round-tripped value rather than the original object.
			expect(decodeDocData(Uint8Array.from(bytes))).toEqual(
				decodeDocData(encodeDocData(VALUES[name]))
			);
		});

		it('accepts a plain number[], as the agent may decode `vec nat8`', () => {
			const [, bytes] = JUNO_ENCODED[0];

			expect(decodeDocData(bytes)).toEqual(decodeDocData(Uint8Array.from(bytes)));
		});
	});

	describe('special types survive a round trip', () => {
		it('restores a bigint', () => {
			expect(decodeDocData<{ v: bigint }>(encodeDocData({ v: 42n })).v).toBe(42n);
		});

		it('restores a Principal', () => {
			const owner = Principal.fromText('wqhtf-fqaaa-aaaal-amssq-cai');

			expect(decodeDocData<{ owner: Principal }>(encodeDocData({ owner })).owner.toText()).toBe(
				owner.toText()
			);
		});

		it('restores a Uint8Array', () => {
			const blob = new Uint8Array([0, 1, 127, 128, 255]);

			expect(decodeDocData<{ blob: Uint8Array }>(encodeDocData({ blob })).blob).toEqual(blob);
		});
	});
});
