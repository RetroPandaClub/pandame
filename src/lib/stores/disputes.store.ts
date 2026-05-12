import type { Dispute } from '$lib/types/dispute';
import { writable, type Readable } from 'svelte/store';

interface DisputesStore extends Readable<Dispute[] | undefined> {
	set: (disputes: Dispute[]) => void;
	upsert: (dispute: Dispute) => void;
	remove: (id: bigint) => void;
	reset: () => void;
}

const initDisputes = (): DisputesStore => {
	const { subscribe, set, update } = writable<Dispute[] | undefined>(undefined);

	return {
		subscribe,
		set,
		upsert: (dispute) =>
			update((current) => {
				if (current === undefined) {
					return [dispute];
				}

				const idx = current.findIndex((d) => d.id === dispute.id);

				if (idx === -1) {
					return [dispute, ...current];
				}

				const next = [...current];
				next[idx] = dispute;

				return next;
			}),
		remove: (id) => update((current) => current?.filter((d) => d.id !== id) ?? current),
		reset: () => set(undefined)
	};
};

/**
 * Disputes the caller is involved with — payer / recipient on the
 * parent deal, or arbitrator on the panel. Mirrors `dealsStore` shape
 * for symmetry; populated by `list_my_disputes` from the
 * Transactions / Profile pages.
 */
export const disputesStore = initDisputes();
