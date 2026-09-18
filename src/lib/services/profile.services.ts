import type { ProfilesDid } from '$declarations';
import { getProfile as getProfileApi, setProfile } from '$lib/api/profiles.api';
import { getIdentityOrAnonymous, safeGetIdentityOnce } from '$lib/services/identity.services';
import { emptyProfile, type UserProfile } from '$lib/types/profile';
import { defaultAvatarUrlForPrincipal } from '$lib/utils/avatar.utils';
import { fromNullable, isNullish, nonNullish, toNullable } from '@dfinity/utils';
import { Principal } from '@icp-sdk/core/principal';

/**
 * Profiles live in the profiles canister, which replaced the satellite's
 * `profiles` Datastore collection. Reads are public, so they go through the
 * anonymous identity when signed out; writes are owner-only and the canister
 * derives the owner from the caller.
 */

const toUserProfile = (profile: ProfilesDid.Profile): UserProfile => ({
	owner: profile.owner.toText(),
	username: profile.username,
	name: profile.name,
	surname: profile.surname,
	avatar_url: fromNullable(profile.avatar_url)
});

// Returns an empty shell (no remote write) for unknown principals so the caller
// can render placeholders without a null-check.
export const getProfile = async (principal: string): Promise<UserProfile> => {
	const existing = await getProfileApi({
		identity: await getIdentityOrAnonymous(),
		owner: Principal.fromText(principal),
		certified: false
	});

	return nonNullish(existing) ? toUserProfile(existing) : emptyProfile(principal);
};

/**
 * Writes the signed-in user's own profile.
 *
 * The optimistic-concurrency dance the Datastore required is gone: the canister
 * keys profiles by caller, so there is no version to read back and no way for
 * one caller's write to clobber another's.
 */
export const upsertProfile = async (profile: UserProfile): Promise<UserProfile> => {
	const saved = await setProfile({
		identity: await safeGetIdentityOnce(),
		profile: {
			username: profile.username,
			name: profile.name,
			surname: profile.surname,
			avatar_url: toNullable(profile.avatar_url)
		}
	});

	return toUserProfile(saved);
};

// First-load-on-sign-in path: guarantees a deterministic DiceBear `avatar_url`
// so every user has a stable default without leaking the raw principal to the
// image host.
export const ensureProfile = async (principal: string): Promise<UserProfile> => {
	const profile = await getProfile(principal);

	const hasAvatar = nonNullish(profile.avatar_url) && profile.avatar_url.length > 0;

	if (hasAvatar) {
		return profile;
	}

	return await upsertProfile({
		...profile,
		avatar_url: defaultAvatarUrlForPrincipal(principal)
	});
};

export const profileIsEmpty = (profile: UserProfile): boolean =>
	isNullish(profile.username) || profile.username.length === 0;
