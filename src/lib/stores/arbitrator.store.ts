import type { Arbitrator } from '$lib/types/arbitrator';
import { writable, type Readable } from 'svelte/store';

// `undefined` = not yet loaded, `null` = loaded + not registered,
// `Arbitrator` = loaded + registered (any status).
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

export const arbitratorStore = initArbitrator();
