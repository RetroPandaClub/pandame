import type { Arbitrator } from '$lib/types/arbitrator';
import { writable, type Readable } from 'svelte/store';

/**
 * Tri-state representation of "is the signed-in user a registered
 * arbitrator?":
 *
 * - `undefined` — not yet loaded for the current principal.
 * - `null`      — loaded; principal is not registered as an arbitrator.
 * - `Arbitrator` — loaded; principal is registered (any status).
 */
type ArbitratorState = Arbitrator | null | undefined;

interface ArbitratorStore extends Readable<ArbitratorState> {
	set: (arbitrator: Arbitrator | null) => void;
	reset: () => void;
}

const initArbitrator = (): ArbitratorStore => {
	const { subscribe, set } = writable<ArbitratorState>(undefined);

	return {
		subscribe,
		set,
		reset: () => set(undefined)
	};
};

/**
 * The currently-signed-in user's arbitrator profile, if registered.
 * Populated by `getArbitrator(principal)` calls from the Profile page.
 */
export const arbitratorStore = initArbitrator();
