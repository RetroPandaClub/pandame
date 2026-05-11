import { Collection } from '$lib/constants/collections.constants';
import { emptyProfile, type UserProfile } from '$lib/types/profile';
import { defaultAvatarUrlForPrincipal } from '$lib/utils/avatar.utils';
import { isNullish, nonNullish } from '@dfinity/utils';
import { getDoc, setDoc, type Doc } from '@junobuild/core';

/**
 * Loads a user profile from the `profiles` datastore. Returns a fresh
 * empty shell (no `version`, no remote write) when the principal has
 * never saved a profile — the caller can render placeholders without
 * an extra null-check.
 *
 * Reads are public so any signed-in user can resolve a principal to
 * a nickname / display name.
 */
export const getProfile = async (principal: string): Promise<Doc<UserProfile>> => {
	const existing = await getDoc<UserProfile>({
		collection: Collection.PROFILES,
		key: principal
	});

	if (nonNullish(existing)) {
		return existing;
	}

	return {
		key: principal,
		data: emptyProfile(principal)
	};
};

/**
 * Upserts the caller's profile. Round-trips the latest `version` from
 * the canister so concurrent edits surface as an explicit error rather
 * than silently overwriting each other.
 *
 * The collection is `write: 'private'` — only the principal whose key
 * matches the doc can call this against their own profile.
 */
export const upsertProfile = async (
	profileDoc: Doc<UserProfile> | { key: string; data: UserProfile }
): Promise<Doc<UserProfile>> => {
	const { key, data } = profileDoc;

	const existing = await getDoc<UserProfile>({
		collection: Collection.PROFILES,
		key
	});

	if (isNullish(existing)) {
		return await setDoc<UserProfile>({
			collection: Collection.PROFILES,
			doc: { key, data }
		});
	}

	if (isNullish(existing.version)) {
		throw new Error('Cannot update profile: existing document is missing a version.');
	}

	return await setDoc<UserProfile>({
		collection: Collection.PROFILES,
		doc: {
			key,
			version: existing.version,
			data: {
				...existing.data,
				...data,
				owner: key
			}
		}
	});
};

/**
 * Ensures the caller's profile exists in the datastore. Returns the
 * canonical profile document — either the one already on chain or a
 * freshly-created empty shell. Callers that just want to read should
 * use `getProfile` directly; this one is for "first-load on sign-in"
 * paths that want a guaranteed `version` so subsequent edits succeed.
 *
 * Also makes sure `avatar_url` is set: if the principal has no profile
 * yet (or has one but never picked an avatar), the doc is persisted
 * with a deterministic DiceBear URL derived from the principal alone.
 * This guarantees every user has a stable default avatar without ever
 * sending the raw principal to the image host.
 */
export const ensureProfile = async (principal: string): Promise<Doc<UserProfile>> => {
	const doc = await getProfile(principal);

	const hasAvatar = nonNullish(doc.data.avatar_url) && doc.data.avatar_url.length > 0;

	if (nonNullish(doc.version) && hasAvatar) {
		return doc;
	}

	return await upsertProfile({
		...doc,
		data: {
			...doc.data,
			avatar_url: hasAvatar ? doc.data.avatar_url : defaultAvatarUrlForPrincipal(principal)
		}
	});
};
