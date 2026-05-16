import type { EscrowDid } from '$declarations';
import * as escrowApi from '$lib/api/escrow.api';
import { ICP_TOKEN } from '$lib/constants/tokens.constants';
import { safeGetIdentityOnce } from '$lib/services/identity.services';
import type { Token } from '$lib/types/token';
import { toNullable } from '@dfinity/utils';
import type { IcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
import { Principal } from '@icp-sdk/core/principal';

const assetForToken = (token: Token): EscrowDid.Asset => ({
	Icrc: Principal.fromText(token.ledgerCanisterId)
});

const escrowAccount = (account: IcrcAccount): EscrowDid.Account => ({
	owner: account.owner,
	subaccount: toNullable(account.subaccount)
});

/**
 * Reads the live `icrc1_balance_of` of the canister-owned treasury
 * subaccount for the deal's settlement token (today only ICP). Every
 * bound deal's `creation_fee` accumulates here at create time and
 * stays until a controller drains it. Controller-gated — non-
 * controllers get `NotAuthorised` from the canister.
 */
export const treasuryBalance = async ({
	token = ICP_TOKEN
}: { token?: Token } = {}): Promise<bigint> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.adminTreasuryBalance({ identity, asset: assetForToken(token) });
};

/**
 * Drains `amount` (in `token`'s base units) from the canister
 * treasury subaccount to `to` via `icrc1_transfer`. The caller sizes
 * `amount` against the live `treasuryBalance` reading; under-funded
 * withdrawals trap with `TransferFailed`. Returns the ledger block
 * index of the transfer for an audit trail. Controller-gated.
 */
export const treasuryWithdraw = async ({
	to,
	amount,
	token = ICP_TOKEN
}: {
	to: IcrcAccount;
	amount: bigint;
	token?: Token;
}): Promise<bigint> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.adminTreasuryWithdraw({
		identity,
		asset: assetForToken(token),
		amount,
		to: escrowAccount(to)
	});
};
