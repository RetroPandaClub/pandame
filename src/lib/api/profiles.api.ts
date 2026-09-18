import type { ProfilesDid } from '$declarations';
import { getAgent } from '$lib/actors/agents.ic';
import { ProfilesCanister } from '$lib/canisters/profiles.canister';
import { PROFILES_CANISTER_ID } from '$lib/constants/canisters.constants';
import type { QueryParams } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';

export const getProfile = async ({
	identity,
	owner,
	...queryParams
}: {
	identity: Identity;
	owner: Principal;
} & QueryParams): Promise<ProfilesDid.Profile | undefined> => {
	const { getProfile } = await profilesCanister({ identity });

	return await getProfile({ owner, ...queryParams });
};

export const setProfile = async ({
	identity,
	profile
}: {
	identity: Identity;
	profile: ProfilesDid.SetProfile;
}): Promise<ProfilesDid.Profile> => {
	const { setProfile } = await profilesCanister({ identity });

	return await setProfile({ profile });
};

const profilesCanister = async ({
	identity
}: {
	identity: Identity;
}): Promise<ProfilesCanister> => {
	const agent = await getAgent({ identity });

	return ProfilesCanister.create({
		agent,
		canisterId: PROFILES_CANISTER_ID
	});
};
