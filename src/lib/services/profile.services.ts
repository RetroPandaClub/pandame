import { getDoc, setDoc, type Doc } from '$lib/api/satellite.api';
import { Collection } from '$lib/constants/collections.constants';
import { emptyProfile, type UserProfile } from '$lib/types/profile';
import { defaultAvatarUrlForPrincipal } from '$lib/utils/avatar.utils';
import { isNullish, nonNullish } from '@dfinity/utils';

// Returns an empty shell (no `version`, no remote write) for unknown
// principals so the caller can render placeholders without a null-check.
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

// Reads the latest `version` first so concurrent edits surface as an
// explicit error instead of silently overwriting.
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

// First-load-on-sign-in path: guarantees a `version` (so later edits
// don't fail) and a deterministic DiceBear `avatar_url` (so every user
// has a stable default avatar without leaking the raw principal to the
// image host).
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
