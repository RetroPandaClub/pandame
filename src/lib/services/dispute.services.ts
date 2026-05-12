import type { EscrowDid } from '$declarations';
import * as escrowApi from '$lib/api/escrow.api';
import { safeGetIdentityOnce } from '$lib/services/identity.services';

export const openDispute = async ({
	dealId
}: {
	dealId: bigint;
}): Promise<EscrowDid.DisputeView> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.openDispute({ identity, dealId });
};

export const getDispute = async ({
	disputeId
}: {
	disputeId: bigint;
}): Promise<EscrowDid.DisputeView> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.getDispute({ identity, disputeId });
};

export const getPublicDispute = async ({
	disputeId
}: {
	disputeId: bigint;
}): Promise<EscrowDid.PublicDisputeView> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.getPublicDispute({ identity, disputeId });
};

export const listMyDisputes = async ({
	offset,
	limit,
	phase
}: {
	offset?: bigint;
	limit?: bigint;
	phase?: EscrowDid.DisputePhase;
} = {}): Promise<EscrowDid.DisputeView[]> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.listMyDisputes({ identity, offset, limit, phase });
};

export const submitEvidence = async ({
	disputeId,
	note,
	artefactUrl,
	artefactSha256
}: {
	disputeId: bigint;
	note?: string;
	artefactUrl?: string;
	artefactSha256?: Uint8Array;
}): Promise<EscrowDid.DisputeView> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.submitEvidence({ identity, disputeId, note, artefactUrl, artefactSha256 });
};

export const castVote = async ({
	disputeId,
	vote
}: {
	disputeId: bigint;
	vote: EscrowDid.Vote;
}): Promise<EscrowDid.DisputeView> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.castVote({ identity, disputeId, vote });
};

export const finalizeDispute = async ({
	disputeId
}: {
	disputeId: bigint;
}): Promise<EscrowDid.DisputeView> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.finalizeDispute({ identity, disputeId });
};

export const withdrawDispute = async ({
	disputeId,
	proposal
}: {
	disputeId: bigint;
	proposal: EscrowDid.Vote | undefined;
}): Promise<EscrowDid.DisputeView> => {
	const identity = await safeGetIdentityOnce();

	return await escrowApi.withdrawDispute({ identity, disputeId, proposal });
};
