import { Principal } from '@icp-sdk/core/principal';

/**
 * Wire format for Datastore document payloads.
 *
 * The satellite stores `Doc.data` as an opaque byte array; the encoding is a
 * client-side convention. These helpers reproduce, byte for byte, what
 * `@junobuild/utils` `toArray` / `fromArray` produced — UTF-8 JSON with a
 * replacer for the three types JSON cannot represent:
 *
 * - `bigint`     -> `{ "__bigint__": "<decimal>" }`
 * - `Principal`  -> `{ "__principal__": "<text>" }`
 * - `Uint8Array` -> `{ "__uint8array__": [ ...bytes ] }`
 *
 * Keeping the format identical is what lets us drop the Juno SDK without
 * touching the data already written to the satellite: documents created by the
 * old client stay readable, and documents we write stay readable by anything
 * still speaking the Juno format.
 *
 * Juno's originals were `async` because they round-tripped through a `Blob`.
 * `TextEncoder`/`TextDecoder` produce the same bytes synchronously.
 */

const BIGINT_KEY = '__bigint__';
const PRINCIPAL_KEY = '__principal__';
const UINT8ARRAY_KEY = '__uint8array__';

export const jsonReplacer = (_key: string, value: unknown): unknown => {
	if (typeof value === 'bigint') {
		return { [BIGINT_KEY]: `${value}` };
	}

	if (value instanceof Uint8Array) {
		return { [UINT8ARRAY_KEY]: Array.from(value) };
	}

	// `Principal.isPrincipal` also accepts structurally-compatible objects coming
	// from another copy of the library, which is why we re-wrap with `Principal.from`.
	if (value !== null && value !== undefined && Principal.isPrincipal(value)) {
		return { [PRINCIPAL_KEY]: Principal.from(value).toText() };
	}

	return value;
};

export const jsonReviver = (_key: string, value: unknown): unknown => {
	if (value === null || typeof value !== 'object') {
		return value;
	}

	const record = value as Record<string, unknown>;

	if (BIGINT_KEY in record) {
		return BigInt(record[BIGINT_KEY] as string);
	}

	if (PRINCIPAL_KEY in record) {
		return Principal.fromText(record[PRINCIPAL_KEY] as string);
	}

	if (UINT8ARRAY_KEY in record) {
		return Uint8Array.from(record[UINT8ARRAY_KEY] as number[]);
	}

	return value;
};

export const encodeDocData = <T>(data: T): Uint8Array =>
	new TextEncoder().encode(JSON.stringify(data, jsonReplacer));

/**
 * The agent may hand back either a `Uint8Array` or a plain `number[]` for a
 * `vec nat8`, depending on how the response was decoded — normalise both.
 */
export const decodeDocData = <T>(data: Uint8Array | number[]): T =>
	JSON.parse(
		new TextDecoder().decode(data instanceof Uint8Array ? data : Uint8Array.from(data)),
		jsonReviver
	) as T;
