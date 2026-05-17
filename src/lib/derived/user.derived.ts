import { userStore } from '$lib/stores/user.store';
import { shortPrincipal } from '$lib/utils/format.utils';
import { derived, type Readable } from 'svelte/store';

export const userSignedIn: Readable<boolean> = derived(
	userStore,
	(user) => user !== null && user !== undefined
);

export const userNotSignedIn: Readable<boolean> = derived(userSignedIn, (signedIn) => !signedIn);

// Read this instead of `$userStore?.key` so every component agrees on
// the principal source of truth and shape changes stay single-file.
export const userPrincipalText: Readable<string | undefined> = derived(
	userStore,
	(user) => user?.key
);

// Empty string while signed-out; consumers that need the full text use `userPrincipalText`.
export const userPrincipalShort: Readable<string> = derived(userPrincipalText, (text) =>
	text === undefined ? '' : shortPrincipal(text)
);
