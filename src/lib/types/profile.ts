import type { CanisterIdText } from '$lib/types/canister';

/**
 * User-editable profile metadata stored in the Juno `profiles` datastore.
 * The document key is always the owner's principal text (so anyone with
 * a principal can resolve the matching profile).
 */
export interface UserProfile {
	owner: CanisterIdText;
	username: string;
	name: string;
	surname: string;
	address: string;
	email: string;
}

/**
 * Returns a fresh profile shell for the given principal.
 */
export const emptyProfile = (owner: CanisterIdText): UserProfile => ({
	owner,
	username: '',
	name: '',
	surname: '',
	address: '',
	email: ''
});
