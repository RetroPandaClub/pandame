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

export const signYes = async ({
	identity,
	dealId,
	...queryParams
}: {
	identity: Identity;
	dealId: bigint;
} & QueryParams): Promise<EscrowDid.DealView> => {
	const { signYes } = await escrowCanister({ identity });

	return await signYes({ dealId, ...queryParams });
};

export const signNo = async ({
	identity,
	dealId,
	...queryParams
}: {
	identity: Identity;
	dealId: bigint;
} & QueryParams): Promise<EscrowDid.DealView> => {
	const { signNo } = await escrowCanister({ identity });

	return await signNo({ dealId, ...queryParams });
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

export const openDispute = async ({
	identity,
	dealId,
	...queryParams
}: {
	identity: Identity;
	dealId: bigint;
} & QueryParams): Promise<EscrowDid.DisputeView> => {
	const { openDispute } = await escrowCanister({ identity });

	return await openDispute({ dealId, ...queryParams });
};

export const getDispute = async ({
	identity,
	disputeId,
	...queryParams
}: {
	identity: Identity;
	disputeId: bigint;
} & QueryParams): Promise<EscrowDid.DisputeView> => {
	const { getDispute } = await escrowCanister({ identity });

	return await getDispute({ disputeId, ...queryParams });
};

export const getPublicDispute = async ({
	identity,
	disputeId,
	...queryParams
}: {
	identity: Identity;
	disputeId: bigint;
} & QueryParams): Promise<EscrowDid.PublicDisputeView> => {
	const { getPublicDispute } = await escrowCanister({ identity });

	return await getPublicDispute({ disputeId, ...queryParams });
};

export const listMyDisputes = async ({
	identity,
	offset,
	limit,
	phase,
	...queryParams
}: {
	identity: Identity;
	offset?: bigint;
	limit?: bigint;
	phase?: EscrowDid.DisputePhase;
} & QueryParams): Promise<EscrowDid.DisputeView[]> => {
	const { listMyDisputes } = await escrowCanister({ identity });

	return await listMyDisputes({ offset, limit, phase, ...queryParams });
};

export const submitEvidence = async ({
	identity,
	disputeId,
	note,
	artefactUrl,
	artefactSha256,
	...queryParams
}: {
	identity: Identity;
	disputeId: bigint;
	note?: string;
	artefactUrl?: string;
	artefactSha256?: Uint8Array;
} & QueryParams): Promise<EscrowDid.DisputeView> => {
	const { submitEvidence } = await escrowCanister({ identity });

	return await submitEvidence({
		disputeId,
		note,
		artefactUrl,
		artefactSha256,
		...queryParams
	});
};

export const castVote = async ({
	identity,
	disputeId,
	vote,
	...queryParams
}: {
	identity: Identity;
	disputeId: bigint;
	vote: EscrowDid.Vote;
} & QueryParams): Promise<EscrowDid.DisputeView> => {
	const { castVote } = await escrowCanister({ identity });

	return await castVote({ disputeId, vote, ...queryParams });
};

export const finalizeDispute = async ({
	identity,
	disputeId,
	...queryParams
}: {
	identity: Identity;
	disputeId: bigint;
} & QueryParams): Promise<EscrowDid.DisputeView> => {
	const { finalizeDispute } = await escrowCanister({ identity });

	return await finalizeDispute({ disputeId, ...queryParams });
};

export const withdrawDispute = async ({
	identity,
	disputeId,
	proposal,
	...queryParams
}: {
	identity: Identity;
	disputeId: bigint;
	proposal: EscrowDid.Vote | undefined;
} & QueryParams): Promise<EscrowDid.DisputeView> => {
	const { withdrawDispute } = await escrowCanister({ identity });

	return await withdrawDispute({ disputeId, proposal, ...queryParams });
};

export const getArbitrator = async ({
	identity,
	principal,
	...queryParams
}: {
	identity: Identity;
	principal: Principal;
} & QueryParams): Promise<EscrowDid.ArbitratorProfile | undefined> => {
	const { getArbitrator } = await escrowCanister({ identity });

	return await getArbitrator({ principal, ...queryParams });
};

export const listArbitrators = async ({
	identity,
	offset,
	limit,
	status,
	minScore,
	...queryParams
}: {
	identity: Identity;
	offset?: bigint;
	limit?: bigint;
	status?: EscrowDid.ArbitratorStatus;
	minScore?: number;
} & QueryParams): Promise<EscrowDid.ArbitratorProfile[]> => {
	const { listArbitrators } = await escrowCanister({ identity });

	return await listArbitrators({ offset, limit, status, minScore, ...queryParams });
};

export const deregisterArbitrator = async ({
	identity,
	...queryParams
}: {
	identity: Identity;
} & QueryParams): Promise<EscrowDid.ArbitratorProfile> => {
	const { deregisterArbitrator } = await escrowCanister({ identity });

	return await deregisterArbitrator(queryParams);
};

export const adminRegisterArbitrator = async ({
	identity,
	principal,
	...queryParams
}: {
	identity: Identity;
	principal: Principal;
} & QueryParams): Promise<EscrowDid.ArbitratorProfile> => {
	const { adminRegisterArbitrator } = await escrowCanister({ identity });

	return await adminRegisterArbitrator({ principal, ...queryParams });
};

export const adminSetArbitratorStatus = async ({
	identity,
	principal,
	status,
	...queryParams
}: {
	identity: Identity;
	principal: Principal;
	status: EscrowDid.ArbitratorStatus;
} & QueryParams): Promise<EscrowDid.ArbitratorProfile> => {
	const { adminSetArbitratorStatus } = await escrowCanister({ identity });

	return await adminSetArbitratorStatus({ principal, status, ...queryParams });
};

const escrowCanister = async ({ identity }: { identity: Identity }): Promise<EscrowCanister> => {
	const agent = await getAgent({ identity });

	return EscrowCanister.create({
		agent,
		canisterId: ESCROW_CANISTER_ID
	});
};
