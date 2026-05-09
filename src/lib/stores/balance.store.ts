import { writable } from 'svelte/store';

/**
 * Caller's ICP balance in e8s. `undefined` = not yet loaded; `null` is
 * unused for now (we keep the convention open in case we surface a
 * "ledger unreachable" state).
 */
export const balanceStore = writable<bigint | undefined>(undefined);
