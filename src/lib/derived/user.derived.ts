import { userStore } from '$lib/stores/user.store';
import { shortPrincipal } from '$lib/utils/format.utils';
import { derived, type Readable } from 'svelte/store';

export const userSignedIn: Readable<boolean> = derived(
	userStore,
	(user) => user !== null && user !== undefined
);

export const userNotSignedIn: Readable<boolean> = derived(userSignedIn, (signedIn) => !signedIn);

/**
 * The caller's principal as a stable string, or `undefined` while the
 * Juno auth state hasn't resolved yet (or after sign-out). Use this
 * instead of reading `$userStore?.key` ad-hoc — keeps every component
 * agreeing on the source of truth + makes future principal-shape
 * changes a single-file edit.
 */
export const userPrincipalText: Readable<string | undefined> = derived(
	userStore,
	(user) => user?.key
);

/**
 * Display-friendly short principal (`abc123…xyz`) for the caller,
 * empty string while not yet signed in. Components that need the
 * full text should read `userPrincipalText`.
 */
export const userPrincipalShort: Readable<string> = derived(userPrincipalText, (text) =>
	text === undefined ? '' : shortPrincipal(text)
);
