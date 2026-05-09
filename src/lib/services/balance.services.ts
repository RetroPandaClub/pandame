import * as ledgerApi from '$lib/api/icrc-ledger.api';
import { ICP_TOKEN } from '$lib/constants/tokens.constants';
import { safeGetIdentityOnce } from '$lib/services/identity.services';
import type { Token } from '$lib/types/token';

/**
 * Fetch the caller's balance on the given token's ledger (defaults to ICP).
 * Subaccount-less account — Internet Identity always uses the principal's
 * default subaccount in this app.
 */
export const myBalance = async ({ token = ICP_TOKEN }: { token?: Token } = {}): Promise<bigint> => {
	const identity = await safeGetIdentityOnce();

	return await ledgerApi.balance({
		identity,
		ledgerCanisterId: token.ledgerCanisterId,
		account: { owner: identity.getPrincipal() }
	});
};
