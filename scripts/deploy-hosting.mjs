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
 * Usage:
 *   node scripts/deploy-hosting.mjs --network ic
 *   node scripts/deploy-hosting.mjs --network local
 *
 * Identity: a PEM file via --pem <path> or the DEPLOY_PEM_PATH env var.
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

	return idl.Service({
		commit_asset_upload: idl.Func([CommitBatch], [], []),
		del_asset: idl.Func([idl.Text, idl.Text], [], []),
		init_asset_upload: idl.Func([InitAssetKey], [InitUploadResult], []),
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

	console.log(`\nDone. https://${canisterId}.icp0.io/`);
};

main().catch((error) => {
	console.error(error.message ?? error);
	process.exit(1);
});
