import { II_MAX_TIME_TO_LIVE_NS, II_WINDOW_FEATURES } from '$lib/constants/app.constants';
import { AuthClientProvider } from '$lib/providers/auth-client.providers';
import { userStore } from '$lib/stores/user.store';
import type { User } from '$lib/types/user';
import { isNullish, nonNullish } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';

/**
 * Sign-in, sign-out and session restore.
 *
 * Replaces `signIn` / `signOut` / `onAuthStateChange` from `@junobuild/core`.
 * The delegation is a plain Internet Identity delegation against this app's
 * origin — the same thing the Juno SDK obtained, from the same provider — so
 * the principal the satellite sees, and therefore every existing document, is
 * unchanged.
 *
 * The identity provider is left at the SDK default, `https://id.ai` (Internet
 * Identity 2.0), which is also what the Juno SDK defaulted to.
 */

/**
 * One-Click sign-in providers supported by Internet Identity 2.0.
 *
 * Passing one makes the SDK add an `openid` search param to the II URL; II
 * runs the OIDC flow against that provider and returns a delegation
 * indistinguishable from a passkey-based II sign-in. This is what replaces
 * Juno's own Google sign-in.
 */
export type OpenIdProvider = 'google' | 'apple' | 'microsoft';

const toUser = (identity: Identity): User => {
	const key = identity.getPrincipal().toText();

	return { key, owner: key };
};

/**
 * Signs the user out when the delegation expires.
 *
 * `initAuth` runs once, so without this the store would stay populated after
 * the delegation's four-hour lifetime: the UI would keep presenting a signed-in
 * user while every canister call failed with an expired identity. The Juno SDK
 * ran an auth worker that fired `junoSignOutAuthTimer` for exactly this; the
 * timer below is what replaces it.
 */
let signOutTimer: ReturnType<typeof setTimeout> | undefined;

const clearScheduledSignOut = () => {
	if (nonNullish(signOutTimer)) {
		clearTimeout(signOutTimer);
		signOutTimer = undefined;
	}
};

const scheduleSignOut = async () => {
	clearScheduledSignOut();

	const expiration = await AuthClientProvider.getInstance().delegationExpiration();

	if (isNullish(expiration)) {
		return;
	}

	const remaining = expiration - Date.now();

	if (remaining <= 0) {
		await signOut();
		return;
	}

	signOutTimer = setTimeout(() => {
		console.warn('Signed out automatically because the session expired');

		signOut();
	}, remaining);
};

export const signIn = async ({
	openIdProvider
}: { openIdProvider?: OpenIdProvider } = {}): Promise<void> => {
	const provider = AuthClientProvider.getInstance();

	// Built synchronously, inside the user-gesture call stack, so the popup is
	// not blocked (Safari in particular).
	const authClient = provider.createAuthClientForSignIn({
		windowOpenerFeatures: II_WINDOW_FEATURES,
		...(nonNullish(openIdProvider) && { openIdProvider })
	});

	const identity = await authClient.signIn({ maxTimeToLive: II_MAX_TIME_TO_LIVE_NS });

	userStore.set(toUser(identity));

	await scheduleSignOut();
};

export const signOut = async (): Promise<void> => {
	clearScheduledSignOut();

	const provider = AuthClientProvider.getInstance();

	const authClient = await provider.createAuthClient();
	await authClient.logout();

	// `logout` clears the delegation but leaves the provider holding a client
	// bound to the now-empty storage; drop it so the next sign-in starts clean.
	provider.reset();

	userStore.set(null);
};

/**
 * Restores the session on load.
 *
 * Never rejects. Callers invoke this from `onMount`, where a rejection would
 * surface as an unhandled promise rejection and — worse — leave the store in
 * its initial `undefined` ("not known yet") state, which guards wait on
 * forever. Anything that goes wrong reading the delegation (blocked or
 * unavailable IndexedDB, a corrupt entry) means we cannot prove the user is
 * signed in, so the safe answer is `null` ("signed out").
 */
export const initAuth = async (): Promise<void> => {
	try {
		const identity = await AuthClientProvider.getInstance().loadIdentity();

		userStore.set(isNullish(identity) ? null : toUser(identity));

		if (nonNullish(identity)) {
			await scheduleSignOut();
		}
	} catch (err) {
		console.error('Failed to restore the session:', err);

		userStore.set(null);
	}
};
