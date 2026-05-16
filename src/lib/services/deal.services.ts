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
 * **Escrow `v0.0.7`.** The standalone `fund_deal` endpoint was removed;
 * funding is now folded into the lifecycle:
 *
 *  - **Tip** (no `recipient`): `create_deal` atomically funds. No
 *    pre-approval needed. Returned `DealView` is already `Funded`.
 *  - **3a payer-creator** (caller is payer, recipient bound):
 *    `create_deal` performs two `icrc2_transfer_from`s on the call —
 *    `amount + DC/2` into the deal subaccount, then `creation_fee`
 *    into the treasury. Caller must pre-approve
 *    `amount + DC/2 + creation_fee + 2*ledger_fee`.
 *  - **3b recipient-creator** (caller is recipient, payer bound):
 *    same two-pull pattern but the caller only deposits their
 *    `DC/2`. Pre-approve `DC/2 + creation_fee + 2*ledger_fee`. The
 *    payer's deposit happens later during `consent_deal`.
 *
 * Both `DC/2` and `creation_fee` values aren't known until after
 * `create_deal` returns the `DealFees` snapshot, so the pre-approval
 * uses the canister's default `DisputeConfig` (`arbitration_fee_bps =
 * 500` → `DC/2 = amount/40`) and `DEFAULT_CREATION_FEE = 20_000`.
 * Over-approval is harmless: the canister pulls only what it needs and
 * the leftover allowance expires with the deal.
 *
 * Return shape kept as `{ created, funded }` (`funded === created`)
 * for call-site compatibility — tips return `Funded`; two-party
 * deals return `Created` and the canister flips them to `Funded` on
 * the counterparty's `consent_deal` call.
 */
export const createAndFundDeal = async (
	request: CreateDealRequest
): Promise<{ created: EscrowDid.DealView; funded: EscrowDid.DealView }> => {
	const identity = await safeGetIdentityOnce();
	const token = request.token ?? ICP_TOKEN;
	const ledger = createdLedger(token);
	const role = inferCreateRole(request);

	if (role !== 'tip-create') {
		const ledgerFee = await ledgerApi.transactionFee({
			identity,
			ledgerCanisterId: token.ledgerCanisterId
		});

		await ledgerApi.approve({
			identity,
			ledgerCanisterId: token.ledgerCanisterId,
			amount: preApprovalAmount({ role, amount: request.amount, ledgerFee }),
			spender: spenderAccount(),
			expiresAt: request.expires_at_ns
		});
	}

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
 * Escrow v0.0.7 folded funding into the consent path: the consenting
 * counterparty deposits whatever the canister still needs (DC/2 for
 * the recipient on a 3a flow; `amount + DC/2` for the payer on a 3b
 * flow). The pre-approval contract per the upstream `tests/it/
 * deals_money_flow.rs` helpers:
 *
 *  - **3a consenting recipient** (their `DC/2`): pre-approve
 *    `DC/2 + ledger_fee`.
 *  - **3b consenting payer** (`amount + DC/2`): pre-approve
 *    `amount + DC/2 + 2*ledger_fee`.
 *
 * Both `DC/2` and `amount` are read off the deal snapshot the caller
 * already has, so the pre-approval is exact (no defaults headroom
 * needed here). Once both parties have consented the canister
 * atomically flips the deal to `Funded` in the same transaction — the
 * returned `DealView` carries the new status. The other consent paths
 * (already-consented recipient re-signing, payer on a 3a flow, etc.)
 * are pure state flips and skip the approve.
 */
export const consentDeal = async ({ deal }: { deal: Deal }): Promise<EscrowDid.DealView> => {
	const identity = await safeGetIdentityOnce();
	const role = inferConsentRole(deal, identity.getPrincipal());

	if (role !== undefined) {
		const ledgerCanisterId = deal.asset.Icrc.toText();
		const ledgerFee = await ledgerApi.transactionFee({ identity, ledgerCanisterId });

		await ledgerApi.approve({
			identity,
			ledgerCanisterId,
			amount: preApprovalAmount({
				role,
				amount: deal.amount,
				disputeReservePerParty: deal.fees.dispute_reserve_per_party,
				ledgerFee
			}),
			spender: spenderAccount(),
			expiresAt: deal.expires_at_ns
		});
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
 * The ICRC-2 spender account for every escrow pre-approval. The
 * canister always calls `icrc2_transfer_from` with
 * `spender_subaccount = None` (see `src/escrow/src/ledger.rs`
 * upstream), so the allowance must be granted to the canister's
 * default subaccount.
 */
const spenderAccount = (): IcrcAccount => ({
	owner: ESCROW_CANISTER_ID,
	subaccount: undefined
});

/**
 * Canister default `DisputeConfig.arbitration_fee_bps` (500 = 5%).
 * Per `compute_arbitration_fee`, full DC = `amount * bps / 10_000`
 * and the per-party reserve is `DC/2`. Used only by the pre-create
 * approval calculator (which doesn't yet have the `Deal.fees`
 * snapshot); pre-consent uses the exact value off the deal.
 */
const ARBITRATION_FEE_BPS_DEFAULT = 500n;

/**
 * Canister `DEFAULT_CREATION_FEE` (20_000 base units). Snapshotted
 * into `Deal.fees.creation_fee` for every bound deal at create time.
 * Source: `src/escrow/src/types/state.rs` upstream.
 *
 * Exported so the `/deals/new` summary can surface a "creation fee"
 * line without re-importing the helper. Tip flows pay zero — there's
 * no bound counterparty to spam-harass.
 */
export const DEFAULT_CREATION_FEE = 20_000n;

const worstCaseDisputeReservePerParty = (amount: bigint): bigint =>
	(amount * ARBITRATION_FEE_BPS_DEFAULT) / 10_000n / 2n;

/**
 * Every distinct ICRC-2 pre-approval escrow v0.0.7 needs. Each
 * variant carries exactly the inputs its allowance math reads —
 * `tip-create` carries none because tips skip pre-approval entirely.
 * Mirrors the `payer_create_approval` / `recipient_create_approval`
 * helpers and the per-flow `ledger.approve(...)` lines in upstream
 * `tests/it/deals_money_flow.rs`.
 */
export type PreApprovalCall =
	| { role: 'tip-create' }
	| { role: 'payer-create'; amount: bigint; ledgerFee: bigint }
	| { role: 'recipient-create'; amount: bigint; ledgerFee: bigint }
	| { role: 'recipient-consent'; disputeReservePerParty: bigint; ledgerFee: bigint }
	| {
			role: 'payer-consent';
			amount: bigint;
			disputeReservePerParty: bigint;
			ledgerFee: bigint;
	  };

/**
 * Returns the ICRC-2 allowance (in the deal's settlement token's base
 * units) the caller must grant the escrow canister before issuing the
 * matching `create_deal` / `consent_deal` call. Includes the `+1`
 * tail the upstream test helpers add to dodge ICRC-2 approve rounding
 * edges (`icrc2_approve` charges the ledger fee from the allowance
 * itself; an off-by-one would surface as `CreationFeeRequired` /
 * `DisputeReserveRequired` at the canister).
 *
 * For the two `create` roles the `DC/2` value is **worst-case**
 * (canister's default config), since `Deal.fees.dispute_reserve_per_party`
 * is only known after `create_deal` returns. For the two `consent`
 * roles we pass the exact value from the deal snapshot. Tip creates
 * skip pre-approval entirely — `create_deal` settles the funding leg
 * atomically without any allowance.
 */
export const preApprovalAmount = (call: PreApprovalCall): bigint => {
	switch (call.role) {
		case 'tip-create':
			return 0n;
		case 'payer-create': {
			const dcHalf = worstCaseDisputeReservePerParty(call.amount);
			return call.amount + dcHalf + DEFAULT_CREATION_FEE + 2n * call.ledgerFee + 1n;
		}
		case 'recipient-create': {
			const dcHalf = worstCaseDisputeReservePerParty(call.amount);
			return dcHalf + DEFAULT_CREATION_FEE + 2n * call.ledgerFee + 1n;
		}
		case 'recipient-consent':
			return call.disputeReservePerParty + call.ledgerFee + 1n;
		case 'payer-consent':
			return call.amount + call.disputeReservePerParty + 2n * call.ledgerFee + 1n;
	}
};

/**
 * Maps a fresh-from-the-UI create request to the pre-approval role.
 * The canister assigns the caller to whichever side wasn't pre-bound
 * in `CreateDealArgs` (see `services::deals::create_deal` upstream);
 * we mirror that here so the caller can pre-approve without round-
 * tripping the deal first.
 *
 *  - no recipient, no payer → tip (caller becomes payer)
 *  - recipient set, no payer → caller is payer (3a)
 *  - no recipient, payer set → caller is recipient (3b)
 *  - both set → ambiguous; treated as 3a here. The /deals/new UI
 *    never produces this combination today.
 */
const inferCreateRole = (
	req: CreateDealRequest
): 'tip-create' | 'payer-create' | 'recipient-create' => {
	const hasRecipient = req.recipient !== undefined;
	const hasPayer = req.payer !== undefined;
	if (!hasRecipient && !hasPayer) {
		return 'tip-create';
	}
	if (hasRecipient && !hasPayer) {
		return 'payer-create';
	}
	if (!hasRecipient && hasPayer) {
		return 'recipient-create';
	}
	return 'payer-create';
};

/**
 * Returns the pre-approval role for a `consent_deal` call, or
 * `undefined` if the caller's side is a pure state flip (e.g. the
 * payer on a 3a deal — recipient already deposited DC/2 at
 * `consent_deal` earlier; payer never needed to pre-deposit). The
 * canister still accepts the call, it just doesn't pull anything.
 */
const inferConsentRole = (
	deal: Deal,
	caller: Principal
): 'recipient-consent' | 'payer-consent' | undefined => {
	const callerSide = sideOf(deal, caller);

	if (
		callerSide === 'recipient' &&
		consentState(deal.recipient_consent) === ConsentStates.Pending
	) {
		return 'recipient-consent';
	}

	if (callerSide === 'payer' && consentState(deal.payer_consent) === ConsentStates.Pending) {
		return 'payer-consent';
	}

	return undefined;
};
