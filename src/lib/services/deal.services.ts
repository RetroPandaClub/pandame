import type { EscrowDid } from '$declarations';
import * as escrowApi from '$lib/api/escrow.api';
import * as ledgerApi from '$lib/api/icrc-ledger.api';
import { ESCROW_CANISTER_ID } from '$lib/constants/canisters.constants';
import { ICP_TOKEN } from '$lib/constants/tokens.constants';
import { safeGetIdentityOnce } from '$lib/services/identity.services';
import type { Token } from '$lib/types/token';
import { toNullable } from '@dfinity/utils';
import type { IcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
import { Principal } from '@icp-sdk/core/principal';

interface CreateDealRequest {
	amount: bigint;
	expires_at_ns: bigint;
	title?: string;
	note?: string;
	recipient?: Principal;
	payer?: Principal;
	token?: Token;
}

const opt = <T>(value: T | undefined): [] | [T] => toNullable(value);

/**
 * Create + fund a deal in a single user-facing flow.
 *
 * Order of operations:
 *  1. `create_deal`        → returns a `DealView` with id + claim_code.
 *  2. `icrc2_approve`      → grants the escrow canister `amount + fee`.
 *  3. `fund_deal`          → escrow runs `transfer_from(payer → subaccount)`.
 *
 * The intermediate `DealView` is returned to the caller so the UI can
 * display the share link / QR even if funding fails.
 */
export const createAndFundDeal = async (
	request: CreateDealRequest
): Promise<{ created: EscrowDid.DealView; funded: EscrowDid.DealView }> => {
	const identity = await safeGetIdentityOnce();
	const token = request.token ?? ICP_TOKEN;

	const created = await escrowApi.createDeal({
		identity,
		params: {
			amount: request.amount,
			expires_at_ns: request.expires_at_ns,
			title: opt(request.title),
			note: opt(request.note),
			recipient: opt(request.recipient),
			payer: opt(request.payer),
			token_ledger: createdLedger(request.token)
		}
	});

	const escrowAccount: IcrcAccount = {
		owner: ESCROW_CANISTER_ID,
		subaccount: created.escrow_subaccount
	};

	// Approve `amount + fee` so the canister's `transfer_from` doesn't
	// fail on the ledger fee deduction.
	await ledgerApi.approve({
		identity,
		ledgerCanisterId: token.ledgerCanisterId,
		amount: request.amount + token.fee,
		spender: escrowAccount,
		expiresAt: request.expires_at_ns
	});

	const funded = await escrowApi.fundDeal({
		identity,
		dealId: created.id
	});

	return { created, funded };
};

/**
 * Accept a funded deal — the recipient's claim path. For open (unbound)
 * deals the `claimCode` is required.
 */
export const acceptDeal = async ({
	dealId,
	claimCode
}: {
	dealId: bigint;
	claimCode?: string;
}): Promise<EscrowDid.DealView> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.acceptDeal({ identity, dealId, claimCode });
};

export const consentDeal = async ({ dealId }: { dealId: bigint }): Promise<EscrowDid.DealView> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.consentDeal({ identity, dealId });
};

export const rejectDeal = async ({ dealId }: { dealId: bigint }): Promise<EscrowDid.DealView> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.rejectDeal({ identity, dealId });
};

export const cancelDeal = async ({ dealId }: { dealId: bigint }): Promise<EscrowDid.DealView> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.cancelDeal({ identity, dealId });
};

export const reclaimDeal = async ({ dealId }: { dealId: bigint }): Promise<EscrowDid.DealView> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.reclaimDeal({ identity, dealId });
};

export const listMyDeals = async ({
	offset,
	limit
}: {
	offset?: bigint;
	limit?: bigint;
} = {}): Promise<EscrowDid.DealView[]> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.listMyDeals({ identity, offset, limit });
};

export const getDeal = async ({ dealId }: { dealId: bigint }): Promise<EscrowDid.DealView> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.getDeal({ identity, dealId });
};

export const getClaimableDeal = async ({
	dealId
}: {
	dealId: bigint;
}): Promise<EscrowDid.ClaimableDealView> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.getClaimableDeal({ identity, dealId });
};

export const getReliability = async ({
	principal
}: {
	principal: Principal;
}): Promise<EscrowDid.ReliabilityView> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.getReliability({ identity, principal });
};

const createdLedger = (token?: Token): Principal =>
	Principal.fromText((token ?? ICP_TOKEN).ledgerCanisterId);
