import type { UserProfile } from '$lib/types/profile';
import type { Doc } from '@junobuild/core';
import { writable, type Readable } from 'svelte/store';

interface ProfileStore extends Readable<Doc<UserProfile> | undefined> {
	set: (doc: Doc<UserProfile>) => void;
	reset: () => void;
}

const initProfile = (): ProfileStore => {
	const { subscribe, set } = writable<Doc<UserProfile> | undefined>(undefined);

	return {
		subscribe,
		set,
		reset: () => set(undefined)
	};
};

/**
 * The currently-signed-in user's profile document. `undefined` until
 * the first `getProfile` call resolves; the inner `version` is the
 * canister round-trip token used by `upsertProfile` for optimistic
 * concurrency.
 */
export const profileStore = initProfile();
