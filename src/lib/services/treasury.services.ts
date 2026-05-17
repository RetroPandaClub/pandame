import type { EscrowDid } from '$declarations';
import * as escrowApi from '$lib/api/escrow.api';
import { SETTLEMENT_TOKEN } from '$lib/constants/tokens.constants';
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

// Controller-gated; non-controllers trap with `NotAuthorised`.
export const treasuryBalance = async ({
	token = SETTLEMENT_TOKEN
}: { token?: Token } = {}): Promise<bigint> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.adminTreasuryBalance({ identity, asset: assetForToken(token) });
};

// Controller-gated. Returns the ledger block index for an audit trail.
// Caller sizes `amount` against `treasuryBalance`; under-funded
// withdrawals trap with `TransferFailed`.
export const treasuryWithdraw = async ({
	to,
	amount,
	token = SETTLEMENT_TOKEN
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
