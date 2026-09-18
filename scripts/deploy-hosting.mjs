#!/usr/bin/env node
/**
 * Uploads the built frontend to the satellite canister.
 *
 * This replaces `juno hosting deploy`. It cannot be replaced by `icp` or `dfx`
 * asset deployment: the satellite does not implement the standard asset
 * canister interface (`create_batch` / `create_chunk` / `commit_batch` /
 * `store`). It exposes Juno's own equivalents instead —
 * `init_asset_upload` / `upload_asset_chunk` / `commit_asset_upload` — so the
 * upload protocol has to be spoken directly. Everything else about the
 * canister is unchanged: same canister ID, same custom domain, same data.
 *
 * Both the satellite and an identity are required; the examples below pass
 * them explicitly because neither has a default.
 *
 * Usage:
 *   node scripts/deploy-hosting.mjs --network ic \
 *     --satellite wqhtf-fqaaa-aaaal-amssq-cai --pem ./deploy.pem
 *
 *   node scripts/deploy-hosting.mjs --network local \
 *     --satellite auamu-4x777-77775-aaaaa-cai --pem ./deploy.pem
 *
 * The satellite may also come from SATELLITE_ID and the identity from
 * DEPLOY_PEM_PATH. `npm run deploy` passes the satellite for you.
 *
 * Assets in the satellite that are absent from `build/` are deleted, so the
 * hosted site matches the build exactly — this is what `juno hosting deploy`
 * did. Pass --keep-stale to upload without deleting anything.
 */
import { Actor, HttpAgent } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { Secp256k1KeyIdentity } from '@icp-sdk/core/identity/secp256k1';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

// Ingress messages are capped at 2 MB; Juno's own client uses 1.9 MB of it.
const CHUNK_SIZE = 1_900_000;

// The collection the satellite serves the app's own frontend from.
const DAPP_COLLECTION = '#dapp';

// `list_assets` is paginated; this is how many entries we pull per call.
const LIST_PAGE_SIZE = 100;

const BUILD_DIR = 'build';

// Hashed filenames are safe to cache forever; everything else must be
// revalidated so a deploy is picked up immediately.
const IMMUTABLE_PREFIX = '/_app/immutable/';
const CACHE_IMMUTABLE = 'public, max-age=31536000, immutable';
const CACHE_REVALIDATE = 'no-cache';

const MIME_TYPES = {
	'.css': 'text/css',
	'.html': 'text/html',
	'.ico': 'image/x-icon',
	'.jpeg': 'image/jpeg',
	'.jpg': 'image/jpeg',
	'.js': 'text/javascript',
	'.json': 'application/json',
	'.map': 'application/json',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.txt': 'text/plain',
	'.wasm': 'application/wasm',
	'.webmanifest': 'application/manifest+json',
	'.webp': 'image/webp',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.xml': 'application/xml'
};

const idlFactory = ({ IDL: idl }) => {
	const InitAssetKey = idl.Record({
		token: idl.Opt(idl.Text),
		collection: idl.Text,
		name: idl.Text,
		description: idl.Opt(idl.Text),
		encoding_type: idl.Opt(idl.Text),
		full_path: idl.Text
	});
	const InitUploadResult = idl.Record({ batch_id: idl.Nat });
	const UploadChunk = idl.Record({
		content: idl.Vec(idl.Nat8),
		batch_id: idl.Nat,
		order_id: idl.Opt(idl.Nat)
	});
	const UploadChunkResult = idl.Record({ chunk_id: idl.Nat });
	const CommitBatch = idl.Record({
		batch_id: idl.Nat,
		headers: idl.Vec(idl.Tuple(idl.Text, idl.Text)),
		chunk_ids: idl.Vec(idl.Nat)
	});

	const AssetKey = idl.Record({
		token: idl.Opt(idl.Text),
		collection: idl.Text,
		owner: idl.Principal,
		name: idl.Text,
		description: idl.Opt(idl.Text),
		full_path: idl.Text
	});
	const AssetEncodingNoContent = idl.Record({
		modified: idl.Nat64,
		sha256: idl.Vec(idl.Nat8),
		total_length: idl.Nat
	});
	const AssetNoContent = idl.Record({
		key: AssetKey,
		updated_at: idl.Nat64,
		encodings: idl.Vec(idl.Tuple(idl.Text, AssetEncodingNoContent)),
		headers: idl.Vec(idl.Tuple(idl.Text, idl.Text)),
		created_at: idl.Nat64,
		version: idl.Opt(idl.Nat64)
	});
	const ListOrderField = idl.Variant({
		UpdatedAt: idl.Null,
		Keys: idl.Null,
		CreatedAt: idl.Null
	});
	const ListOrder = idl.Record({ field: ListOrderField, desc: idl.Bool });
	const TimestampMatcher = idl.Variant({
		Equal: idl.Nat64,
		Between: idl.Tuple(idl.Nat64, idl.Nat64),
		GreaterThan: idl.Nat64,
		LessThan: idl.Nat64
	});
	const ListMatcher = idl.Record({
		key: idl.Opt(idl.Text),
		updated_at: idl.Opt(TimestampMatcher),
		description: idl.Opt(idl.Text),
		created_at: idl.Opt(TimestampMatcher)
	});
	const ListPaginate = idl.Record({
		start_after: idl.Opt(idl.Text),
		limit: idl.Opt(idl.Nat64)
	});
	const ListParams = idl.Record({
		order: idl.Opt(ListOrder),
		owner: idl.Opt(idl.Principal),
		matcher: idl.Opt(ListMatcher),
		paginate: idl.Opt(ListPaginate)
	});
	const ListResults = idl.Record({
		matches_pages: idl.Opt(idl.Nat64),
		matches_length: idl.Nat64,
		items_page: idl.Opt(idl.Nat64),
		items: idl.Vec(idl.Tuple(idl.Text, AssetNoContent)),
		items_length: idl.Nat64
	});

	return idl.Service({
		commit_asset_upload: idl.Func([CommitBatch], [], []),
		del_asset: idl.Func([idl.Text, idl.Text], [], []),
		init_asset_upload: idl.Func([InitAssetKey], [InitUploadResult], []),
		list_assets: idl.Func([idl.Text, ListParams], [ListResults], ['query']),
		upload_asset_chunk: idl.Func([UploadChunk], [UploadChunkResult], [])
	});
};

const arg = (name) => {
	const index = process.argv.indexOf(`--${name}`);
	return index === -1 ? undefined : process.argv[index + 1];
};

const loadIdentity = async () => {
	const pemPath = arg('pem') ?? process.env.DEPLOY_PEM_PATH;

	if (pemPath === undefined) {
		throw new Error('Provide an identity with --pem <path> or DEPLOY_PEM_PATH.');
	}

	const pem = await readFile(pemPath, 'utf-8');

	// dfx writes Secp256k1 for `dfx identity new`, Ed25519 for imported keys.
	return pem.includes('EC PRIVATE KEY')
		? Secp256k1KeyIdentity.fromPem(pem)
		: Ed25519KeyIdentity.fromPem(pem);
};

const walk = async (dir) => {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const path = join(dir, entry.name);
			return entry.isDirectory() ? await walk(path) : [path];
		})
	);
	return files.flat();
};

const extname = (path) => {
	const index = path.lastIndexOf('.');
	return index === -1 ? '' : path.slice(index);
};

/**
 * Turns the build output into the asset list to upload.
 *
 * A sibling `foo.gz` is not a separate asset: it is the gzip *encoding* of
 * `foo`, uploaded under the same `full_path` with `encoding_type = gzip`. The
 * satellite then picks the encoding per request's `Accept-Encoding`.
 */
const collectAssets = async (buildDir) => {
	const paths = await walk(buildDir);
	const identityPaths = paths.filter((path) => !path.endsWith('.gz'));
	const gzipped = new Set(paths.filter((path) => path.endsWith('.gz')));

	return identityPaths.map((path) => {
		const fullPath = `/${relative(buildDir, path).split(sep).join('/')}`;
		const gzipPath = `${path}.gz`;

		return {
			fullPath,
			name: fullPath.slice(fullPath.lastIndexOf('/') + 1),
			contentType: MIME_TYPES[extname(fullPath)],
			encodings: [
				{ path, encodingType: undefined },
				...(gzipped.has(gzipPath) ? [{ path: gzipPath, encodingType: 'gzip' }] : [])
			]
		};
	});
};

const uploadEncoding = async ({ actor, asset, encoding }) => {
	const content = await readFile(encoding.path);

	const { batch_id } = await actor.init_asset_upload({
		token: [],
		collection: DAPP_COLLECTION,
		name: asset.name,
		description: [],
		encoding_type: encoding.encodingType === undefined ? [] : [encoding.encodingType],
		full_path: asset.fullPath
	});

	const chunkIds = [];
	for (let start = 0; start < content.length; start += CHUNK_SIZE) {
		const { chunk_id } = await actor.upload_asset_chunk({
			content: new Uint8Array(content.subarray(start, start + CHUNK_SIZE)),
			batch_id,
			order_id: [BigInt(chunkIds.length)]
		});
		chunkIds.push(chunk_id);
	}

	await actor.commit_asset_upload({
		batch_id,
		chunk_ids: chunkIds,
		headers: [
			...(asset.contentType === undefined ? [] : [['Content-Type', asset.contentType]]),
			[
				'Cache-Control',
				asset.fullPath.startsWith(IMMUTABLE_PREFIX) ? CACHE_IMMUTABLE : CACHE_REVALIDATE
			]
		]
	});
};

/**
 * Every asset currently stored in the collection.
 *
 * `list_assets` is paginated, so this walks the pages with `start_after`
 * rather than assuming one call returns everything.
 */
const listAllAssets = async ({ actor }) => {
	const fullPaths = [];
	let startAfter = [];

	for (;;) {
		const { items } = await actor.list_assets(DAPP_COLLECTION, {
			order: [],
			owner: [],
			matcher: [],
			paginate: [{ start_after: startAfter, limit: [BigInt(LIST_PAGE_SIZE)] }]
		});

		if (items.length === 0) {
			return fullPaths;
		}

		for (const [, asset] of items) {
			fullPaths.push(asset.key.full_path);
		}

		if (items.length < LIST_PAGE_SIZE) {
			return fullPaths;
		}

		startAfter = [items[items.length - 1][0]];
	}
};

/**
 * Deletes assets the satellite still serves that this build no longer
 * contains, so the hosted site matches `build/` exactly.
 *
 * Without this, a renamed or deleted file stays publicly served forever — and
 * because SvelteKit fingerprints its chunks, every deploy would otherwise
 * leave the whole previous bundle behind. `juno hosting deploy` did this for
 * us; the replacement has to do it too.
 */
const pruneStaleAssets = async ({ actor, assets }) => {
	const current = new Set(assets.map(({ fullPath }) => fullPath));
	const stale = (await listAllAssets({ actor })).filter((fullPath) => !current.has(fullPath));

	if (stale.length === 0) {
		console.log('\nNo stale assets to remove.');
		return;
	}

	console.log(`\nRemoving ${stale.length} assets no longer in the build:`);

	for (const fullPath of stale) {
		await actor.del_asset(DAPP_COLLECTION, fullPath);
		console.log(`  - ${fullPath}`);
	}
};

const main = async () => {
	const network = arg('network') ?? 'local';
	const canisterId = process.env.SATELLITE_ID ?? arg('satellite');

	if (canisterId === undefined) {
		throw new Error('Provide the satellite with --satellite <id> or SATELLITE_ID.');
	}

	await stat(BUILD_DIR).catch(() => {
		throw new Error(`No ${BUILD_DIR}/ directory — run \`npm run build\` first.`);
	});

	const host = network === 'ic' ? 'https://icp-api.io' : 'http://127.0.0.1:5987';
	const identity = await loadIdentity();
	const agent = await HttpAgent.create({ host, identity });

	if (network !== 'ic') {
		await agent.fetchRootKey();
	}

	const actor = Actor.createActor(idlFactory, { agent, canisterId });

	const assets = await collectAssets(BUILD_DIR);

	console.log(
		`Deploying ${assets.length} assets to ${canisterId} (${network}) as ${identity.getPrincipal().toText()}`
	);

	// Sequential on purpose: each upload is several ingress messages, and the
	// satellite bills cycles per call. Parallelising here mostly produces
	// throttling and partially-committed batches.
	for (const asset of assets) {
		for (const encoding of asset.encodings) {
			await uploadEncoding({ actor, asset, encoding });
		}
		console.log(`  ${asset.fullPath}`);
	}

	if (process.argv.includes('--keep-stale')) {
		console.log('\nSkipping stale asset cleanup (--keep-stale).');
	} else {
		await pruneStaleAssets({ actor, assets });
	}

	console.log(`\nDone. https://${canisterId}.icp0.io/`);
};

main().catch((error) => {
	console.error(error.message ?? error);
	process.exit(1);
});
