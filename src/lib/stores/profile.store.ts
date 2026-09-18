import type { UserProfile } from '$lib/types/profile';
import { writable, type Readable } from 'svelte/store';

interface ProfileStore extends Readable<UserProfile | undefined> {
	set: (profile: UserProfile) => void;
	reset: () => void;
}

const initProfile = (): ProfileStore => {
	const { subscribe, set } = writable<UserProfile | undefined>(undefined);

	return {
		subscribe,
		set,
		reset: () => set(undefined)
	};
};

/**
 * The currently-signed-in user's profile. `undefined` until the first
 * `getProfile` call resolves.
 *
 * This used to wrap a Juno `Doc`, whose `version` was the optimistic-concurrency
 * token for writes. The profiles canister keys by caller instead, so there is
 * no version to carry around and the profile is stored directly.
 */
export const profileStore = initProfile();
