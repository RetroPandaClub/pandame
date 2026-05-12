import { DisputePhases } from '$lib/enums/dispute';
import { disputesStore } from '$lib/stores/disputes.store';
import { disputePhase } from '$lib/utils/dispute.utils';
import { derived } from 'svelte/store';

export const disputesLoaded = derived(disputesStore, (disputes) => disputes !== undefined);

export const disputesCount = derived(disputesStore, (disputes) => disputes?.length ?? 0);

export const openDisputes = derived(
	disputesStore,
	(disputes) =>
		disputes?.filter((dispute) => disputePhase(dispute) !== DisputePhases.Resolved) ?? []
);

export const resolvedDisputes = derived(
	disputesStore,
	(disputes) =>
		disputes?.filter((dispute) => disputePhase(dispute) === DisputePhases.Resolved) ?? []
);
