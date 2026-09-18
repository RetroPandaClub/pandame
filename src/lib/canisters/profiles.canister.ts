import {
	idlFactoryCertifiedProfiles,
	idlFactoryProfiles,
	type ProfilesDid,
	type ProfilesService
} from '$declarations';
import type { CreateCanisterOptions } from '$lib/types/canister';
import { Canister, createServices, type QueryParams } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';

/**
 * The profiles canister — what used to be the satellite's `profiles` Datastore
 * collection. Same access model: publicly readable, writable only by the owner.
 */
export class ProfilesCanister extends Canister<ProfilesService> {
	static create(options: CreateCanisterOptions<ProfilesService>) {
		const { service, certifiedService, canisterId } = createServices<ProfilesService>({
			options,
			idlFactory: idlFactoryProfiles,
			certifiedIdlFactory: idlFactoryCertifiedProfiles
		});

		return new ProfilesCanister(canisterId, service, certifiedService);
	}

	getProfile = async ({
		owner,
		...queryParams
	}: {
		owner: Principal;
	} & QueryParams): Promise<ProfilesDid.Profile | undefined> => {
		const { get_profile } = this.caller(queryParams);

		const [profile] = await get_profile(owner);

		return profile;
	};

	// Always an update call: the canister derives the owner from the caller, so
	// this only ever writes the signed-in user's own profile.
	setProfile = async ({
		profile
	}: {
		profile: ProfilesDid.SetProfile;
	}): Promise<ProfilesDid.Profile> => {
		const { set_profile } = this.caller({ certified: true });

		const result = await set_profile(profile);

		if ('Err' in result) {
			throw new Error(`Failed to save profile: ${result.Err}`);
		}

		return result.Ok;
	};
}
