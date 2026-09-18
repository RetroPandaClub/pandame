#!/usr/bin/env node
/**
 * Creates (or updates) this app's Datastore collections on a satellite.
 *
 * This replaces the `satellite.collections.datastore` block of
 * `juno.config.ts` and the `juno config apply` command that pushed it.
 *
 * The production satellite already has these collections — this is really for
 * a freshly started local emulator, which boots empty, and for making the
 * rules explicit and version-controlled now that `juno.config.ts` is gone.
 *
 * Usage:
 *   node scripts/setup-collections.mjs --network local --pem <path>
 */
import { Actor, HttpAgent } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { Secp256k1KeyIdentity } from '@icp-sdk/core/identity/secp256k1';
import { readFile } from 'node:fs/promises';

/**
 * Keep in sync with `Collection` in
 * `src/lib/constants/collections.constants.ts`.
 *
 * `read: Public` so any caller can resolve a profile from a principal;
 * `write: Private` so only the owner can edit their own document.
 */
const COLLECTIONS = [
	{
		collection: 'profiles',
		memory: { Stable: null },
		read: { Public: null },
		write: { Private: null }
	}
];

const idlFactory = ({ IDL }) => {
	const Memory = IDL.Variant({ Heap: IDL.Null, Stable: IDL.Null });
	const Permission = IDL.Variant({
		Controllers: IDL.Null,
		Private: IDL.Null,
		Public: IDL.Null,
		Managed: IDL.Null
	});
	const RateConfig = IDL.Record({
		max_tokens: IDL.Nat64,
		time_per_token_ns: IDL.Nat64
	});
	const SetRule = IDL.Record({
		max_capacity: IDL.Opt(IDL.Nat32),
		memory: IDL.Opt(Memory),
		max_size: IDL.Opt(IDL.Nat),
		read: Permission,
		version: IDL.Opt(IDL.Nat64),
		mutable_permissions: IDL.Opt(IDL.Bool),
		rate_config: IDL.Opt(RateConfig),
		write: Permission,
		max_changes_per_user: IDL.Opt(IDL.Nat32)
	});
	const CollectionType = IDL.Variant({ Db: IDL.Null, Storage: IDL.Null });
	const Rule = IDL.Record({ version: IDL.Opt(IDL.Nat64) });
	const ListRulesParams = IDL.Record({ matcher: IDL.Opt(IDL.Text) });
	const ListRulesResults = IDL.Record({
		items_length: IDL.Nat64,
		items: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Record({ version: IDL.Opt(IDL.Nat64) })))
	});

	return IDL.Service({
		get_rule: IDL.Func(
			[CollectionType, IDL.Text],
			[IDL.Opt(IDL.Record({ version: IDL.Opt(IDL.Nat64) }))],
			['query']
		),
		list_rules: IDL.Func([CollectionType, ListRulesParams], [ListRulesResults], ['query']),
		set_rule: IDL.Func([CollectionType, IDL.Text, SetRule], [Rule], [])
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

	return pem.includes('EC PRIVATE KEY')
		? Secp256k1KeyIdentity.fromPem(pem)
		: Ed25519KeyIdentity.fromPem(pem);
};

const main = async () => {
	const network = arg('network') ?? 'local';
	const canisterId = process.env.SATELLITE_ID ?? arg('satellite');

	if (canisterId === undefined) {
		throw new Error('Provide the satellite with --satellite <id> or SATELLITE_ID.');
	}

	const host = network === 'ic' ? 'https://icp-api.io' : 'http://127.0.0.1:5987';
	const agent = await HttpAgent.create({ host, identity: await loadIdentity() });

	if (network !== 'ic') {
		await agent.fetchRootKey();
	}

	const actor = Actor.createActor(idlFactory, { agent, canisterId });

	for (const { collection, ...rule } of COLLECTIONS) {
		// `set_rule` needs the current version to update an existing collection,
		// and no version to create one.
		const existing = await actor.get_rule({ Db: null }, collection);
		const version = existing.length === 0 ? [] : existing[0].version;

		await actor.set_rule({ Db: null }, collection, {
			max_capacity: [],
			memory: [rule.memory],
			max_size: [],
			read: rule.read,
			version,
			mutable_permissions: [],
			rate_config: [],
			write: rule.write,
			max_changes_per_user: []
		});

		console.log(`${existing.length === 0 ? 'created' : 'updated'}  ${collection}`);
	}
};

main().catch((error) => {
	console.error(error.message ?? error);
	process.exit(1);
});
