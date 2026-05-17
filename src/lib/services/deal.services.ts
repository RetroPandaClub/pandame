import type { EscrowDid } from '$declarations';
import * as escrowApi from '$lib/api/escrow.api';
import * as ledgerApi from '$lib/api/icrc-ledger.api';
import { ESCROW_CANISTER_ID } from '$lib/constants/canisters.constants';
import { SETTLEMENT_TOKEN } from '$lib/constants/tokens.constants';
import { ConsentStates } from '$lib/enums/deal-status';
import { safeGetIdentityOnce } from '$lib/services/identity.services';
import { dealsStore } from '$lib/stores/deals.store';
import type { Deal } from '$lib/types/deal';
import type { Token } from '$lib/types/token';
import { consentState, sideOf } from '$lib/utils/deal.utils';
import { emit } from '$lib/utils/events.utils';
import { toNullable } from '@dfinity/utils';
import type { IcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
import { Principal } from '@icp-sdk/core/principal';

const reflectDeal = (deal: EscrowDid.DealView): void => {
	dealsStore.upsert(deal);
	emit({ message: 'pandameReloadDeals' });
};

interface CreateDealRequest {
	amount: bigint;
	expires_at_ns: bigint;
	title?: string;
	note?: string;
	recipient?: Principal;
	payer?: Principal;
	token?: Token;
	/** Pinned at create time; canister rejects values outside its configured range. */
	panelSize?: number;
}

const opt = <T>(value: T | undefined): [] | [T] => toNullable(value);

/**
 * Two-party deals need a pre-approval because `create_deal` pulls
 * funds in the same call; the exact amounts aren't known until the
 * deal is created, so we over-approve worst-case (harmless: the
 * canister pulls only what it needs and the leftover expires with
 * the deal). Tips skip pre-approval — they fund atomically.
 *
 * `{ created, funded }` is kept for call-site compatibility; for
 * two-party deals `funded` is the `Created` snapshot — it flips to
 * `Funded` when the counterparty consents.
 */
export const createAndFundDeal = async (
	request: CreateDealRequest
): Promise<{ created: EscrowDid.DealView; funded: EscrowDid.DealView }> => {
	const identity = await safeGetIdentityOnce();
	const token = request.token ?? SETTLEMENT_TOKEN;
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

	reflectDeal(created);

	return { created, funded: created };
};

/**
 * Tip-claim entrypoint (`/claim/[deal_id]`). Open deals require the
 * `claimCode`. Bound-deal UIs should call `signYes` / `signNo`
 * directly; `acceptDeal` aliases `sign_yes` for them, which is
 * confusing in flows that don't model signatures.
 */
export const acceptDeal = async ({
	dealId,
	claimCode
}: {
	dealId: bigint;
	claimCode?: string;
}): Promise<EscrowDid.DealView> => {
	const identity = await safeGetIdentityOnce();

	const updated = await escrowApi.acceptDeal({ identity, dealId, claimCode });
	reflectDeal(updated);
	return updated;
};

/** Bound-deal only; tips trap with `DisputeRequiresBoundRecipient`. */
export const signYes = async ({ dealId }: { dealId: bigint }): Promise<EscrowDid.DealView> => {
	const identity = await safeGetIdentityOnce();

	const updated = await escrowApi.signYes({ identity, dealId });
	reflectDeal(updated);
	return updated;
};

/** Bound-deal only; tips trap with `DisputeRequiresBoundRecipient`. */
export const signNo = async ({ dealId }: { dealId: bigint }): Promise<EscrowDid.DealView> => {
	const identity = await safeGetIdentityOnce();

	const updated = await escrowApi.signNo({ identity, dealId });
	reflectDeal(updated);
	return updated;
};

/**
 * Pre-approves only when the caller still owes a deposit; pure
 * state-flip consents (e.g. payer on a 3a deal) skip it. Amounts are
 * exact because the deal snapshot already carries the fees.
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

	const updated = await escrowApi.consentDeal({ identity, dealId: deal.id });
	reflectDeal(updated);
	return updated;
};

export const rejectDeal = async ({ dealId }: { dealId: bigint }): Promise<EscrowDid.DealView> => {
	const identity = await safeGetIdentityOnce();

	const updated = await escrowApi.rejectDeal({ identity, dealId });
	reflectDeal(updated);
	return updated;
};

export const cancelDeal = async ({ dealId }: { dealId: bigint }): Promise<EscrowDid.DealView> => {
	const identity = await safeGetIdentityOnce();

	const updated = await escrowApi.cancelDeal({ identity, dealId });
	reflectDeal(updated);
	return updated;
};

export const reclaimDeal = async ({ dealId }: { dealId: bigint }): Promise<EscrowDid.DealView> => {
	const identity = await safeGetIdentityOnce();

	const updated = await escrowApi.reclaimDeal({ identity, dealId });
	reflectDeal(updated);
	return updated;
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
	Principal.fromText((token ?? SETTLEMENT_TOKEN).ledgerCanisterId);

// Canister calls `icrc2_transfer_from` with no spender subaccount, so
// allowances must target the default subaccount.
const spenderAccount = (): IcrcAccount => ({
	owner: ESCROW_CANISTER_ID,
	subaccount: undefined
});

// Canister default (5% → DC/2 = amount/40). Only used by the
// pre-create estimator; pre-consent reads the exact value off the deal.
const ARBITRATION_FEE_BPS_DEFAULT = 500n;

// Exported so the create-deal summary can show the fee line without
// re-deriving it. Tips pay zero (no counterparty to spam-harass).
export const DEFAULT_CREATION_FEE = 20_000n;

const worstCaseDisputeReservePerParty = (amount: bigint): bigint =>
	(amount * ARBITRATION_FEE_BPS_DEFAULT) / 10_000n / 2n;

/** Each variant carries only the inputs its allowance math needs. */
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
 * Allowance the caller must grant before the matching `create_deal` /
 * `consent_deal` call. The `+1` tail covers an ICRC-2 approve
 * rounding edge: `icrc2_approve` charges its ledger fee from the
 * allowance itself, so an off-by-one would later trap as
 * `CreationFeeRequired` / `DisputeReserveRequired`. Create roles use
 * worst-case `DC/2` (no fee snapshot yet); consent roles read the
 * exact value off the deal.
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

// Mirrors the canister's "caller is whichever side wasn't pre-bound"
// rule so we can pre-approve without round-tripping the deal first.
// The "both bound" case is ambiguous; we resolve as payer because the
// create-deal UI never produces it today.
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

// `undefined` means the caller has nothing to deposit (pure state
// flip) — the canister still accepts the call.
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
