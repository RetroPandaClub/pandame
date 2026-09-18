import { AuthClientProvider } from '$lib/providers/auth-client.providers';
import { isNullish } from '@dfinity/utils';
import { AnonymousIdentity, type Identity } from '@icp-sdk/core/agent';

export const getIdentity = async (): Promise<Identity | undefined> =>
	await AuthClientProvider.getInstance().loadIdentity();

// Use for public reads where signed-out callers must still go through.
export const getIdentityOrAnonymous = async (): Promise<Identity> =>
	(await getIdentity()) ?? new AnonymousIdentity();

// Throws if not signed in — call from authenticated paths only.
export const safeGetIdentityOnce = async (): Promise<Identity> => {
	const identity = await getIdentity();

	if (isNullish(identity)) {
		throw new Error('Not authenticated');
	}

	return identity;
};
