import { ArbitratorStatuses } from '$lib/enums/arbitrator';
import { arbitratorStore } from '$lib/stores/arbitrator.store';
import { arbitratorStatus } from '$lib/utils/arbitrator.utils';
import { derived } from 'svelte/store';

// True once the round-trip is done (registered or not).
export const arbitratorLoaded = derived(arbitratorStore, (state) => state !== undefined);

// True for any registered status; gates the "Profile Arbitrator" entry.
export const isArbitrator = derived(
	arbitratorStore,
	(state) => state !== undefined && state !== null
);

// True only while eligible for new dispute panels.
export const isActiveArbitrator = derived(
	arbitratorStore,
	(state) =>
		state !== undefined && state !== null && arbitratorStatus(state) === ArbitratorStatuses.Active
);
