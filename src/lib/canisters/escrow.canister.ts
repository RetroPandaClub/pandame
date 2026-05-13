import {
	idlFactoryCertifiedEscrow,
	idlFactoryEscrow,
	type EscrowDid,
	type EscrowService
} from '$declarations';
import type { CreateCanisterOptions } from '$lib/types/canister';
import { Canister, createServices, jsonReplacer, type QueryParams } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';

/**
 * Typed error thrown by every `EscrowCanister.*` method on an `Err`
 * variant — preserves the original `EscrowError` payload so call sites
 * can branch on the variant tag (`'PanelSizeOutOfRange' in err.variant`,
 * `'InsufficientArbitrators' in err.variant`, …) without regex'ing the
 * JSON-stringified message.
 *
 * The fallback `.message` keeps the previous "Failed to {op}: …" text
 * so existing `console.error` / display sites still work unchanged.
 */
export class EscrowCanisterError extends Error {
	readonly variant: EscrowDid.EscrowError;
	readonly op: string;

	constructor(op: string, variant: EscrowDid.EscrowError) {
		super(`Failed to ${op}: ${JSON.stringify(variant, jsonReplacer)}`);
		this.name = 'EscrowCanisterError';
		this.op = op;
		this.variant = variant;
	}
}

const unwrap = <T>(result: { Ok: T } | { Err: EscrowDid.EscrowError }, op: string): T => {
	if ('Ok' in result) {
		return result.Ok;
	}

	throw new EscrowCanisterError(op, result.Err);
};

export class EscrowCanister extends Canister<EscrowService> {
	static create(options: CreateCanisterOptions<EscrowService>) {
		const { service, certifiedService, canisterId } = createServices<EscrowService>({
			options,
			idlFactory: idlFactoryEscrow,
			certifiedIdlFactory: idlFactoryCertifiedEscrow
		});

		return new EscrowCanister(canisterId, service, certifiedService);
	}

	createDeal = async ({
		params,
		...queryParams
	}: {
		params: EscrowDid.CreateDealArgs;
	} & QueryParams): Promise<EscrowDid.DealView> => {
		const { create_deal } = this.caller(queryParams);

		return unwrap(await create_deal(params), 'create deal');
	};

	fundDeal = async ({
		dealId,
		...queryParams
	}: {
		dealId: bigint;
	} & QueryParams): Promise<EscrowDid.DealView> => {
		const { fund_deal } = this.caller(queryParams);

		return unwrap(await fund_deal({ deal_id: dealId }), 'fund deal');
	};

	acceptDeal = async ({
		dealId,
		claimCode,
		...queryParams
	}: {
		dealId: bigint;
		claimCode?: string;
	} & QueryParams): Promise<EscrowDid.DealView> => {
		const { accept_deal } = this.caller(queryParams);

		return unwrap(
			await accept_deal({
				deal_id: dealId,
				claim_code: claimCode === undefined ? [] : [claimCode]
			}),
			'accept deal'
		);
	};

	consentDeal = async ({
		dealId,
		...queryParams
	}: {
		dealId: bigint;
	} & QueryParams): Promise<EscrowDid.DealView> => {
		const { consent_deal } = this.caller(queryParams);

		return unwrap(await consent_deal({ deal_id: dealId }), 'consent to deal');
	};

	rejectDeal = async ({
		dealId,
		...queryParams
	}: {
		dealId: bigint;
	} & QueryParams): Promise<EscrowDid.DealView> => {
		const { reject_deal } = this.caller(queryParams);

		return unwrap(await reject_deal({ deal_id: dealId }), 'reject deal');
	};

	cancelDeal = async ({
		dealId,
		...queryParams
	}: {
		dealId: bigint;
	} & QueryParams): Promise<EscrowDid.DealView> => {
		const { cancel_deal } = this.caller(queryParams);

		return unwrap(await cancel_deal({ deal_id: dealId }), 'cancel deal');
	};

	reclaimDeal = async ({
		dealId,
		...queryParams
	}: {
		dealId: bigint;
	} & QueryParams): Promise<EscrowDid.DealView> => {
		const { reclaim_deal } = this.caller(queryParams);

		return unwrap(await reclaim_deal({ deal_id: dealId }), 'reclaim deal');
	};

	getDeal = async ({
		dealId,
		...queryParams
	}: {
		dealId: bigint;
	} & QueryParams): Promise<EscrowDid.DealView> => {
		const { get_deal } = this.caller(queryParams);

		return unwrap(await get_deal(dealId), 'get deal');
	};

	getClaimableDeal = async ({
		dealId,
		...queryParams
	}: {
		dealId: bigint;
	} & QueryParams): Promise<EscrowDid.ClaimableDealView> => {
		const { get_claimable_deal } = this.caller(queryParams);

		return unwrap(await get_claimable_deal(dealId), 'get claimable deal');
	};

	getEscrowAccount = async ({
		dealId,
		...queryParams
	}: {
		dealId: bigint;
	} & QueryParams): Promise<EscrowDid.Account> => {
		const { get_escrow_account } = this.caller(queryParams);

		return unwrap(await get_escrow_account(dealId), 'get escrow account');
	};

	listMyDeals = async ({
		offset,
		limit,
		...queryParams
	}: {
		offset?: bigint;
		limit?: bigint;
	} & QueryParams): Promise<EscrowDid.DealView[]> => {
		const { list_my_deals } = this.caller(queryParams);

		return await list_my_deals({
			offset: offset === undefined ? [] : [offset],
			limit: limit === undefined ? [] : [limit]
		});
	};

	getReliability = async ({
		principal,
		...queryParams
	}: {
		principal: Principal;
	} & QueryParams): Promise<EscrowDid.ReliabilityView> => {
		const { get_reliability } = this.caller(queryParams);

		return await get_reliability(principal);
	};

	openDispute = async ({
		dealId,
		...queryParams
	}: {
		dealId: bigint;
	} & QueryParams): Promise<EscrowDid.DisputeView> => {
		const { open_dispute } = this.caller(queryParams);

		return unwrap(await open_dispute({ deal_id: dealId }), 'open dispute');
	};

	getDispute = async ({
		disputeId,
		...queryParams
	}: {
		disputeId: bigint;
	} & QueryParams): Promise<EscrowDid.DisputeView> => {
		const { get_dispute } = this.caller(queryParams);

		return unwrap(await get_dispute(disputeId), 'get dispute');
	};

	getPublicDispute = async ({
		disputeId,
		...queryParams
	}: {
		disputeId: bigint;
	} & QueryParams): Promise<EscrowDid.PublicDisputeView> => {
		const { get_public_dispute } = this.caller(queryParams);

		return unwrap(await get_public_dispute(disputeId), 'get public dispute');
	};

	listMyDisputes = async ({
		offset,
		limit,
		phase,
		...queryParams
	}: {
		offset?: bigint;
		limit?: bigint;
		phase?: EscrowDid.DisputePhase;
	} & QueryParams): Promise<EscrowDid.DisputeView[]> => {
		const { list_my_disputes } = this.caller(queryParams);

		return await list_my_disputes({
			offset: offset === undefined ? [] : [offset],
			limit: limit === undefined ? [] : [limit],
			phase: phase === undefined ? [] : [phase]
		});
	};

	submitEvidence = async ({
		disputeId,
		note,
		artefactUrl,
		artefactSha256,
		...queryParams
	}: {
		disputeId: bigint;
		note?: string;
		artefactUrl?: string;
		artefactSha256?: Uint8Array;
	} & QueryParams): Promise<EscrowDid.DisputeView> => {
		const { submit_evidence } = this.caller(queryParams);

		return unwrap(
			await submit_evidence({
				dispute_id: disputeId,
				note: note === undefined ? [] : [note],
				artefact_url: artefactUrl === undefined ? [] : [artefactUrl],
				artefact_sha256: artefactSha256 === undefined ? [] : [artefactSha256]
			}),
			'submit evidence'
		);
	};

	castVote = async ({
		disputeId,
		vote,
		...queryParams
	}: {
		disputeId: bigint;
		vote: EscrowDid.Vote;
	} & QueryParams): Promise<EscrowDid.DisputeView> => {
		const { cast_vote } = this.caller(queryParams);

		return unwrap(await cast_vote({ dispute_id: disputeId, vote }), 'cast vote');
	};

	finalizeDispute = async ({
		disputeId,
		...queryParams
	}: {
		disputeId: bigint;
	} & QueryParams): Promise<EscrowDid.DisputeView> => {
		const { finalize_dispute } = this.caller(queryParams);

		return unwrap(await finalize_dispute({ dispute_id: disputeId }), 'finalize dispute');
	};

	withdrawDispute = async ({
		disputeId,
		proposal,
		...queryParams
	}: {
		disputeId: bigint;
		proposal: EscrowDid.Vote | undefined;
	} & QueryParams): Promise<EscrowDid.DisputeView> => {
		const { withdraw_dispute } = this.caller(queryParams);

		return unwrap(
			await withdraw_dispute({
				dispute_id: disputeId,
				proposal: proposal === undefined ? [] : [proposal]
			}),
			'withdraw dispute'
		);
	};

	getArbitrator = async ({
		principal,
		...queryParams
	}: {
		principal: Principal;
	} & QueryParams): Promise<EscrowDid.ArbitratorProfile | undefined> => {
		const { get_arbitrator } = this.caller(queryParams);

		const result = await get_arbitrator(principal);

		return result.length === 0 ? undefined : result[0];
	};

	listArbitrators = async ({
		offset,
		limit,
		status,
		minScore,
		...queryParams
	}: {
		offset?: bigint;
		limit?: bigint;
		status?: EscrowDid.ArbitratorStatus;
		minScore?: number;
	} & QueryParams): Promise<EscrowDid.ArbitratorProfile[]> => {
		const { list_arbitrators } = this.caller(queryParams);

		return await list_arbitrators({
			offset: offset === undefined ? [] : [offset],
			limit: limit === undefined ? [] : [limit],
			status: status === undefined ? [] : [status],
			min_score: minScore === undefined ? [] : [minScore]
		});
	};

	deregisterArbitrator = async (
		queryParams?: QueryParams
	): Promise<EscrowDid.ArbitratorProfile> => {
		const { deregister_arbitrator } = this.caller(queryParams ?? {});

		return unwrap(await deregister_arbitrator(), 'deregister arbitrator');
	};

	adminRegisterArbitrator = async ({
		principal,
		...queryParams
	}: {
		principal: Principal;
	} & QueryParams): Promise<EscrowDid.ArbitratorProfile> => {
		const { admin_register_arbitrator } = this.caller(queryParams);

		return unwrap(await admin_register_arbitrator({ principal }), 'admin register arbitrator');
	};

	adminSetArbitratorStatus = async ({
		principal,
		status,
		...queryParams
	}: {
		principal: Principal;
		status: EscrowDid.ArbitratorStatus;
	} & QueryParams): Promise<EscrowDid.ArbitratorProfile> => {
		const { admin_set_arbitrator_status } = this.caller(queryParams);

		return unwrap(
			await admin_set_arbitrator_status({ principal, status }),
			'admin set arbitrator status'
		);
	};

	getConfig = async (queryParams?: QueryParams): Promise<EscrowDid.Config> => {
		const { config } = this.caller(queryParams ?? {});

		return await config();
	};

	updateConfig = async ({
		config,
		...queryParams
	}: {
		config: EscrowDid.Config;
	} & QueryParams): Promise<void> => {
		const { update_config } = this.caller(queryParams);

		const result = await update_config(config);

		if ('Err' in result) {
			throw new Error(`Failed to update config: ${JSON.stringify(result.Err)}`);
		}
	};
}
