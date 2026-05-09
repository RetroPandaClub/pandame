import { profileStore } from '$lib/stores/profile.store';
import { shortPrincipal } from '$lib/utils/format.utils';
import { derived } from 'svelte/store';

export const profileLoaded = derived(profileStore, (doc) => doc !== undefined);

/**
 * Best-effort display name: full name → username → short principal.
 */
export const profileDisplayName = derived(profileStore, (doc): string => {
	if (doc === undefined) {
		return '';
	}

	const { name, surname, username, owner } = doc.data;
	const fullName = [name, surname].filter((part) => part.trim().length > 0).join(' ');

	if (fullName.length > 0) {
		return fullName;
	}

	if (username.trim().length > 0) {
		return username;
	}

	return shortPrincipal(owner);
});
