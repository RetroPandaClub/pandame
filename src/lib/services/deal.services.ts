import type { EscrowDid } from '$declarations';
import * as escrowApi from '$lib/api/escrow.api';
import * as ledgerApi from '$lib/api/icrc-ledger.api';
import { ESCROW_CANISTER_ID } from '$lib/constants/canisters.constants';
import { ICP_TOKEN } from '$lib/constants/tokens.constants';
import { ConsentStates } from '$lib/enums/deal-status';
import { safeGetIdentityOnce } from '$lib/services/identity.services';
import type { Deal } from '$lib/types/deal';
import type { Token } from '$lib/types/token';
import { consentState, sideOf } from '$lib/utils/deal.utils';
import { toNullable } from '@dfinity/utils';
import type { IcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
import type { Identity } from '@icp-sdk/core/agent';
import { Principal } from '@icp-sdk/core/principal';

interface CreateDealRequest {
	amount: bigint;
	expires_at_ns: bigint;
	title?: string;
	note?: string;
	recipient?: Principal;
	payer?: Principal;
	token?: Token;
	/**
	 * Per-deal arbitrator panel size. `Some(n)` pins `n` arbitrators
	 * for any dispute on the deal (a contract at create time);
	 * `undefined` falls back to the canister's
	 * `DisputeConfig.panel_size`. The canister rejects values outside
	 * `[min_panel_size, max_panel_size]` with `PanelSizeOutOfRange`.
	 */
	panelSize?: number;
}

const opt = <T>(value: T | undefined): [] | [T] => toNullable(value);

/**
 * Create + fund a deal in a single user-facing flow.
 *
 * Order of operations:
 *  1. `create_deal`        → returns a `DealView` with id + claim_code +
 *                            the snapshotted `DealFees`.
 *  2. `icrc1_fee`          → reads the live ledger fee. We query it
 *                            instead of using `token.fee` because the
 *                            canister re-reads the live fee at
 *                            `transfer_from` time; a stale constant
 *                            would risk an allowance shortfall if the
 *                            ledger's fee has drifted.
 *  3. `icrc2_approve`      → grants the escrow canister
 *                            `amount + dispute_reserve_per_party + live ledger fee`.
 *                            The canister's `fund_deal` pulls
 *                            `amount + DC/2` in a single
 *                            `transfer_from`; the live fee covers the
 *                            ledger's allowance debit.
 *  4. `fund_deal`          → escrow runs `transfer_from(payer → subaccount)`.
 *
 * The intermediate `DealView` is returned to the caller so the UI can
 * display the share link / QR even if funding fails.
 */
export const createAndFundDeal = async (
	request: CreateDealRequest
): Promise<{ created: EscrowDid.DealView; funded: EscrowDid.DealView }> => {
	const identity = await safeGetIdentityOnce();
	const token = request.token ?? ICP_TOKEN;
	const ledger = createdLedger(token);

	const created = await escrowApi.createDeal({
		identity,
		params: {
			amount: request.amount,
			expires_at_ns: request.expires_at_ns,
			title: opt(request.title),
			note: opt(request.note),
			recipient: opt(request.recipient),
			payer: opt(request.payer),
			asset: { Icrc: ledger },
			panel_size: opt(request.panelSize)
		}
	});

	const escrowAccount: IcrcAccount = {
		owner: ESCROW_CANISTER_ID,
		subaccount: created.escrow_subaccount
	};

	const ledgerFee = await ledgerApi.transactionFee({
		identity,
		ledgerCanisterId: token.ledgerCanisterId
	});

	await ledgerApi.approve({
		identity,
		ledgerCanisterId: token.ledgerCanisterId,
		amount: request.amount + created.fees.dispute_reserve_per_party + ledgerFee,
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

/**
 * Consent to a deal's terms.
 *
 * For a **bound recipient** with `Pending` consent the canister pulls
 * the receiver's `DC/2` dispute reserve via `icrc2_transfer_from` —
 * we must therefore approve `DC/2 + ledger_fee` to the escrow canister
 * before invoking `consent_deal`, or the canister returns
 * `DisputeReserveRequired`. Payer consent (and a recipient consent
 * that has already deposited the reserve) is a pure state flip, so we
 * skip the approve in those cases.
 */
export const consentDeal = async ({ deal }: { deal: Deal }): Promise<EscrowDid.DealView> => {
	const identity = await safeGetIdentityOnce();
	const callerSide = sideOf(deal, identity.getPrincipal());

	if (
		callerSide === 'recipient' &&
		consentState(deal.recipient_consent) === ConsentStates.Pending
	) {
		await approveDisputeReserve({ identity, deal });
	}

	return await escrowApi.consentDeal({ identity, dealId: deal.id });
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

/**
 * Approve `DC/2 + ledger_fee` to the escrow canister so the next
 * `consent_deal` call can pull the receiver's dispute reserve via
 * `icrc2_transfer_from`. The ledger principal lives on the deal's
 * `asset` variant — today always `Icrc`.
 */
const approveDisputeReserve = async ({
	identity,
	deal
}: {
	identity: Identity;
	deal: Deal;
}): Promise<void> => {
	const escrowAccount: IcrcAccount = {
		owner: ESCROW_CANISTER_ID,
		subaccount: deal.escrow_subaccount
	};

	const ledgerCanisterId = deal.asset.Icrc.toText();
	const ledgerFee = await ledgerApi.transactionFee({ identity, ledgerCanisterId });

	await ledgerApi.approve({
		identity,
		ledgerCanisterId,
		amount: deal.fees.dispute_reserve_per_party + ledgerFee,
		spender: escrowAccount,
		expiresAt: deal.expires_at_ns
	});
};
