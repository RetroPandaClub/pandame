import { idlFactory, type SatelliteDoc, type SatelliteService } from '$lib/api/satellite.did';
import { REPLICA_HOST } from '$lib/constants/app.constants';
import { SATELLITE_ID } from '$lib/constants/satellite.constants';
import { getIdentityOrAnonymous } from '$lib/services/identity.services';
import { decodeDocData, encodeDocData } from '$lib/utils/doc-data.utils';
import { fromNullable, isNullish, toNullable } from '@dfinity/utils';
import { Actor, HttpAgent, type Identity } from '@icp-sdk/core/agent';

/**
 * Datastore access against the satellite canister.
 *
 * Replaces `getDoc` / `setDoc` / `deleteDoc` from `@junobuild/core`. The
 * canister, its collections and its stored bytes are untouched — see
 * `doc-data.utils` for the payload encoding that keeps existing documents
 * readable.
 */

export interface Doc<T> {
	key: string;
	data: T;
	owner?: string;
	description?: string;
	created_at?: bigint;
	updated_at?: bigint;
	version?: bigint;
}

const createAgent = async (identity: Identity): Promise<HttpAgent> => {
	const agent = await HttpAgent.create({ host: REPLICA_HOST, identity });

	// A local replica's root key is not the mainnet one the agent ships with.
	if (REPLICA_HOST !== 'https://icp-api.io') {
		await agent.fetchRootKey();
	}

	return agent;
};

const satelliteActor = async (): Promise<SatelliteService> => {
	const identity = await getIdentityOrAnonymous();

	return Actor.createActor<SatelliteService>(idlFactory, {
		agent: await createAgent(identity),
		canisterId: SATELLITE_ID
	});
};

const toDoc = <T>({ key, doc }: { key: string; doc: SatelliteDoc }): Doc<T> => ({
	key,
	data: decodeDocData<T>(doc.data),
	owner: doc.owner.toText(),
	description: fromNullable(doc.description),
	created_at: doc.created_at,
	updated_at: doc.updated_at,
	version: fromNullable(doc.version)
});

export const getDoc = async <T>({
	collection,
	key
}: {
	collection: string;
	key: string;
}): Promise<Doc<T> | undefined> => {
	const actor = await satelliteActor();

	const result = fromNullable(await actor.get_doc(collection, key));

	return isNullish(result) ? undefined : toDoc<T>({ key, doc: result });
};

/**
 * Creates or updates a document.
 *
 * `version` is the satellite's optimistic-concurrency token: omit it to
 * create, pass the version last read to update. A stale version is rejected by
 * the canister rather than silently overwriting.
 */
export const setDoc = async <T>({
	collection,
	doc: { key, data, description, version }
}: {
	collection: string;
	doc: { key: string; data: T; description?: string; version?: bigint };
}): Promise<Doc<T>> => {
	const actor = await satelliteActor();

	const result = await actor.set_doc(collection, key, {
		data: encodeDocData(data),
		description: toNullable(description),
		version: toNullable(version)
	});

	return toDoc<T>({ key, doc: result });
};

export const deleteDoc = async ({
	collection,
	doc: { key, version }
}: {
	collection: string;
	doc: { key: string; version?: bigint };
}): Promise<void> => {
	const actor = await satelliteActor();

	await actor.del_doc(collection, key, { version: toNullable(version) });
};
