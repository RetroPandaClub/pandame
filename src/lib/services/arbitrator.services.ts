import type { EscrowDid } from '$declarations';
import * as escrowApi from '$lib/api/escrow.api';
import { safeGetIdentityOnce } from '$lib/services/identity.services';
import { arbitratorStore } from '$lib/stores/arbitrator.store';
import type { Principal } from '@icp-sdk/core/principal';

export const getArbitrator = async ({
	principal
}: {
	principal: Principal;
}): Promise<EscrowDid.ArbitratorProfile | undefined> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.getArbitrator({ identity, principal });
};

/**
 * Loads the signed-in user's arbitrator profile (if any) into
 * `arbitratorStore`. Idempotent — safe to call from any route's
 * `$effect`. Maps "not registered" to a `null` store value so the UI
 * can distinguish "not loaded yet" (`undefined`) from "loaded, no
 * profile" (`null`).
 */
export const ensureArbitrator = async ({
	principal
}: {
	principal: Principal;
}): Promise<EscrowDid.ArbitratorProfile | null> => {
	const profile = (await getArbitrator({ principal })) ?? null;

	arbitratorStore.set(profile);

	return profile;
};

export const listArbitrators = async ({
	offset,
	limit,
	status,
	minScore
}: {
	offset?: bigint;
	limit?: bigint;
	status?: EscrowDid.ArbitratorStatus;
	minScore?: number;
} = {}): Promise<EscrowDid.ArbitratorProfile[]> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.listArbitrators({ identity, offset, limit, status, minScore });
};

export const deregisterArbitrator = async (): Promise<EscrowDid.ArbitratorProfile> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.deregisterArbitrator({ identity });
};

export const adminRegisterArbitrator = async ({
	principal
}: {
	principal: Principal;
}): Promise<EscrowDid.ArbitratorProfile> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.adminRegisterArbitrator({ identity, principal });
};

export const adminSetArbitratorStatus = async ({
	principal,
	status
}: {
	principal: Principal;
	status: EscrowDid.ArbitratorStatus;
}): Promise<EscrowDid.ArbitratorProfile> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.adminSetArbitratorStatus({ identity, principal, status });
};
