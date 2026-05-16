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
 * Create a deal.
 *
 * **Transitional shape — escrow `v0.0.7`.** The standalone `fund_deal`
 * endpoint was removed (PR #41 upstream); funding is now folded into
 * the lifecycle:
 *
 *  - **Tip** (no `recipient`): `create_deal` atomically funds. The
 *    returned `DealView` is already `Funded`.
 *  - **Two-party** (3a payer-creator / 3b recipient-creator):
 *    `create_deal` requires pre-approval of `amount? + DC/2 +
 *    creation_fee + 2*ledger_fee` BEFORE this call; once both sides
 *    consent the canister atomically flips the deal to `Funded` inside
 *    `consent_deal`.
 *
 * This PR (bindings + types only) wires the API surface to compile
 * against the new IDL. The pre-approval calculator, `consent_deal`
 * pre-approval contract, `sign_yes` / `sign_no` settlement actions
 * and the `CreationFeeRequired` friendly-error mapping land in the
 * follow-up PRs. Until PR #3 lands, two-party `create_deal` calls
 * still trap at the canister with `CreationFeeRequired` /
 * `DisputeReserveRequired` — tip flow is unaffected.
 *
 * Return shape kept as `{ created, funded }` (funded === created)
 * so call sites are untouched; the eventual rename / shape change
 * is tracked in PR #2.
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

	return { created, funded: created };
};

/**
 * Accept a funded deal — the recipient's claim path. For open (unbound)
 * deals the `claimCode` is required.
 *
 * In escrow `v0.0.7` the canister's `accept_deal` for bound recipients
 * routes through `sign_yes` (so it only flips `recipient_signature`
 * to `Yes`; settlement happens once the payer also signs `Yes` or the
 * auto-YES expiry sweep fires). For tip flows (unbound recipient with
 * `claim_code`), `accept_deal` still binds the recipient and settles
 * the deal atomically. Bound-deal UIs should prefer `signYes` /
 * `signNo` directly for clarity — `acceptDeal` stays for the public
 * `/claim/[deal_id]` tip-claim flow.
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
 * Records the caller's `Yes` settlement signature on a `Funded` bound
 * deal. Once both parties have signed `Yes` the canister atomically
 * tallies to `Settled`; a `Yes` vs `No` mix auto-opens a dispute. The
 * caller must be the payer or recipient — tip flows trap with
 * `DisputeRequiresBoundRecipient`.
 */
export const signYes = async ({ dealId }: { dealId: bigint }): Promise<EscrowDid.DealView> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.signYes({ identity, dealId });
};

/**
 * Records the caller's `No` settlement signature on a `Funded` bound
 * deal. Both parties on `No` collapses the deal to `Aborted` (refund
 * to payer); a `Yes` vs `No` mix auto-opens a dispute. Same caller /
 * tip / re-sign semantics as [`signYes`].
 */
export const signNo = async ({ dealId }: { dealId: bigint }): Promise<EscrowDid.DealView> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.signNo({ identity, dealId });
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
