import type { Deal } from '$lib/types/deal';
import { writable, type Readable } from 'svelte/store';

interface DealsStore extends Readable<Deal[] | undefined> {
	set: (deals: Deal[]) => void;
	upsert: (deal: Deal) => void;
	remove: (id: bigint) => void;
	reset: () => void;
}

const initDeals = (): DealsStore => {
	const { subscribe, set, update } = writable<Deal[] | undefined>(undefined);

	return {
		subscribe,
		set,
		upsert: (deal) =>
			update((current) => {
				if (current === undefined) {
					return [deal];
				}

				const idx = current.findIndex((d) => d.id === deal.id);

				if (idx === -1) {
					return [deal, ...current];
				}

				const next = [...current];
				next[idx] = deal;

				return next;
			}),
		remove: (id) => update((current) => current?.filter((d) => d.id !== id) ?? current),
		reset: () => set(undefined)
	};
};

export const dealsStore = initDeals();
