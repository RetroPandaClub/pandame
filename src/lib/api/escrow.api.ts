import type { EscrowDid } from '$declarations';
import { getAgent } from '$lib/actors/agents.ic';
import { EscrowCanister } from '$lib/canisters/escrow.canister';
import { ESCROW_CANISTER_ID } from '$lib/constants/canisters.constants';
import type { QueryParams } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';

export const createDeal = async ({
	identity,
	params,
	...queryParams
}: {
	identity: Identity;
	params: EscrowDid.CreateDealArgs;
} & QueryParams): Promise<EscrowDid.DealView> => {
	const { createDeal } = await escrowCanister({ identity });

	return await createDeal({ params, ...queryParams });
};

export const fundDeal = async ({
	identity,
	dealId,
	...queryParams
}: {
	identity: Identity;
	dealId: bigint;
} & QueryParams): Promise<EscrowDid.DealView> => {
	const { fundDeal } = await escrowCanister({ identity });

	return await fundDeal({ dealId, ...queryParams });
};

export const acceptDeal = async ({
	identity,
	dealId,
	claimCode,
	...queryParams
}: {
	identity: Identity;
	dealId: bigint;
	claimCode?: string;
} & QueryParams): Promise<EscrowDid.DealView> => {
	const { acceptDeal } = await escrowCanister({ identity });

	return await acceptDeal({ dealId, claimCode, ...queryParams });
};

export const consentDeal = async ({
	identity,
	dealId,
	...queryParams
}: {
	identity: Identity;
	dealId: bigint;
} & QueryParams): Promise<EscrowDid.DealView> => {
	const { consentDeal } = await escrowCanister({ identity });

	return await consentDeal({ dealId, ...queryParams });
};

export const rejectDeal = async ({
	identity,
	dealId,
	...queryParams
}: {
	identity: Identity;
	dealId: bigint;
} & QueryParams): Promise<EscrowDid.DealView> => {
	const { rejectDeal } = await escrowCanister({ identity });

	return await rejectDeal({ dealId, ...queryParams });
};

export const cancelDeal = async ({
	identity,
	dealId,
	...queryParams
}: {
	identity: Identity;
	dealId: bigint;
} & QueryParams): Promise<EscrowDid.DealView> => {
	const { cancelDeal } = await escrowCanister({ identity });

	return await cancelDeal({ dealId, ...queryParams });
};

export const reclaimDeal = async ({
	identity,
	dealId,
	...queryParams
}: {
	identity: Identity;
	dealId: bigint;
} & QueryParams): Promise<EscrowDid.DealView> => {
	const { reclaimDeal } = await escrowCanister({ identity });

	return await reclaimDeal({ dealId, ...queryParams });
};

export const getDeal = async ({
	identity,
	dealId,
	...queryParams
}: {
	identity: Identity;
	dealId: bigint;
} & QueryParams): Promise<EscrowDid.DealView> => {
	const { getDeal } = await escrowCanister({ identity });

	return await getDeal({ dealId, ...queryParams });
};

export const getClaimableDeal = async ({
	identity,
	dealId,
	...queryParams
}: {
	identity: Identity;
	dealId: bigint;
} & QueryParams): Promise<EscrowDid.ClaimableDealView> => {
	const { getClaimableDeal } = await escrowCanister({ identity });

	return await getClaimableDeal({ dealId, ...queryParams });
};

export const getEscrowAccount = async ({
	identity,
	dealId,
	...queryParams
}: {
	identity: Identity;
	dealId: bigint;
} & QueryParams): Promise<EscrowDid.Account> => {
	const { getEscrowAccount } = await escrowCanister({ identity });

	return await getEscrowAccount({ dealId, ...queryParams });
};

export const listMyDeals = async ({
	identity,
	offset,
	limit,
	...queryParams
}: {
	identity: Identity;
	offset?: bigint;
	limit?: bigint;
} & QueryParams): Promise<EscrowDid.DealView[]> => {
	const { listMyDeals } = await escrowCanister({ identity });

	return await listMyDeals({ offset, limit, ...queryParams });
};

export const getReliability = async ({
	identity,
	principal,
	...queryParams
}: {
	identity: Identity;
	principal: Principal;
} & QueryParams): Promise<EscrowDid.ReliabilityView> => {
	const { getReliability } = await escrowCanister({ identity });

	return await getReliability({ principal, ...queryParams });
};

const escrowCanister = async ({ identity }: { identity: Identity }): Promise<EscrowCanister> => {
	const agent = await getAgent({ identity });

	return EscrowCanister.create({
		agent,
		canisterId: ESCROW_CANISTER_ID
	});
};
