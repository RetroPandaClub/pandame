import type { CanisterIdText } from '$lib/types/canister';

/**
 * The signed-in user.
 *
 * Previously `User` from `@junobuild/core`, which was the `#user` document the
 * satellite kept per principal. Nothing in this app read that document's
 * fields — only its `key`, which is the caller's principal text — so the local
 * shape is deliberately just the identity, resolved from the delegation rather
 * than fetched from the canister.
 */
export interface User {
	key: CanisterIdText;
	owner: CanisterIdText;
}

export type UserOption = User | undefined | null;
