import { ArbitratorStatuses } from '$lib/enums/arbitrator';
import { arbitratorStore } from '$lib/stores/arbitrator.store';
import { arbitratorStatus } from '$lib/utils/arbitrator.utils';
import { derived } from 'svelte/store';

/**
 * `true` once we've finished the round-trip for the current principal,
 * regardless of whether the user is registered or not.
 */
export const arbitratorLoaded = derived(arbitratorStore, (state) => state !== undefined);

/**
 * `true` when the signed-in user has any registered arbitrator profile
 * (Active, Suspended, or Deregistered). The Profile page uses this
 * to surface the "Profile Arbitrator" entry only when relevant.
 */
export const isArbitrator = derived(
	arbitratorStore,
	(state) => state !== undefined && state !== null
);

/**
 * `true` only when the user is currently an `Active` arbitrator —
 * i.e. eligible for new dispute panels.
 */
export const isActiveArbitrator = derived(
	arbitratorStore,
	(state) =>
		state !== undefined && state !== null && arbitratorStatus(state) === ArbitratorStatuses.Active
);
