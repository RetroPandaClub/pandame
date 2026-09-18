import type { ActorMethod } from '@icp-sdk/core/agent';
import { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

/**
 * Trimmed Candid interface for the Juno satellite canister.
 *
 * The satellites stay exactly as deployed — same canister IDs, same custom
 * domains, same stored data. Dropping the Juno SDK only changes *how* we call
 * them: through a plain agent actor instead of `@junobuild/core`.
 *
 * Only the Datastore methods this app calls are declared here; the canister
 * exposes ~68 more (assets, proposals, controllers, config) that we
 * deliberately do not surface. Shapes mirror `@junobuild/ic-client`'s
 * `declarations/satellite`. Written by hand in TypeScript rather than
 * generated, because it is a deliberate subset that should not be regenerated
 * wholesale.
 */

const Doc = IDL.Record({
	updated_at: IDL.Nat64,
	owner: IDL.Principal,
	data: IDL.Vec(IDL.Nat8),
	description: IDL.Opt(IDL.Text),
	created_at: IDL.Nat64,
	version: IDL.Opt(IDL.Nat64)
});

const SetDoc = IDL.Record({
	data: IDL.Vec(IDL.Nat8),
	description: IDL.Opt(IDL.Text),
	version: IDL.Opt(IDL.Nat64)
});

const DelDoc = IDL.Record({
	version: IDL.Opt(IDL.Nat64)
});

export const idlFactory: IDL.InterfaceFactory = () =>
	IDL.Service({
		del_doc: IDL.Func([IDL.Text, IDL.Text, DelDoc], [], []),
		get_doc: IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(Doc)], ['query']),
		set_doc: IDL.Func([IDL.Text, IDL.Text, SetDoc], [Doc], [])
	});

export interface SatelliteDoc {
	updated_at: bigint;
	owner: Principal;
	data: Uint8Array | number[];
	description: [] | [string];
	created_at: bigint;
	version: [] | [bigint];
}

export interface SatelliteSetDoc {
	data: Uint8Array | number[];
	description: [] | [string];
	version: [] | [bigint];
}

export interface SatelliteDelDoc {
	version: [] | [bigint];
}

export interface SatelliteService {
	del_doc: ActorMethod<[string, string, SatelliteDelDoc], undefined>;
	get_doc: ActorMethod<[string, string], [] | [SatelliteDoc]>;
	set_doc: ActorMethod<[string, string, SatelliteSetDoc], SatelliteDoc>;
}
