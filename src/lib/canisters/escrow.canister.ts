import {
	idlFactoryCertifiedEscrow,
	idlFactoryEscrow,
	type EscrowDid,
	type EscrowService
} from '$declarations';
import type { CreateCanisterOptions } from '$lib/types/canister';
import { Canister, createServices, jsonReplacer, type QueryParams } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';

const unwrap = <T>(result: { Ok: T } | { Err: EscrowDid.EscrowError }, op: string): T => {
	if ('Ok' in result) {
		return result.Ok;
	}

	throw new Error(`Failed to ${op}: ${JSON.stringify(result.Err, jsonReplacer)}`);
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
}
