import { isNullish } from '@dfinity/utils';
import { AnonymousIdentity, type Identity } from '@icp-sdk/core/agent';
import { getIdentityOnce } from '@junobuild/core';

export const getIdentity = async (): Promise<Identity | undefined | null> =>
	await getIdentityOnce();

// Use for public reads where signed-out callers must still go through.
export const getIdentityOrAnonymous = async (): Promise<Identity> => {
	const identity = await getIdentity();

	return identity ?? new AnonymousIdentity();
};

// Throws if not signed in — call from authenticated paths only.
export const safeGetIdentityOnce = async (): Promise<Identity> => {
	const identity = await getIdentity();

	if (isNullish(identity)) {
		throw new Error('Not authenticated');
	}

	return identity;
};
