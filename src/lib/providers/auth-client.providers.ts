import { isNullish, nonNullish } from '@dfinity/utils';
import {
	AuthClient,
	type AuthClientCreateOptions,
	IdbStorage,
	KEY_STORAGE_DELEGATION,
	KEY_STORAGE_KEY
} from '@icp-sdk/auth/client';
import type { Identity } from '@icp-sdk/core/agent';
import { DelegationChain, isDelegationValid } from '@icp-sdk/core/identity';

type SignInAuthClientOptions = Pick<
	AuthClientCreateOptions,
	'identityProvider' | 'windowOpenerFeatures' | 'derivationOrigin' | 'openIdProvider'
>;

/**
 * Owns the Internet Identity `AuthClient` and the delegation it stores.
 *
 * This replaces the session handling that `@junobuild/core` used to do behind
 * `signIn` / `signOut` / `onAuthStateChange`. The resulting delegation is an
 * ordinary II delegation, so the principal the satellite sees is unchanged —
 * existing users keep their documents.
 *
 * Modelled on the equivalent provider in `oisy-wallet`.
 */
export class AuthClientProvider {
	static #instance: AuthClientProvider;

	// Dedicated storage so a new sign-in can clear it without touching
	// anything else the app keeps in IndexedDB.
	readonly #storage: IdbStorage;

	#authClient: AuthClient | undefined;

	private constructor() {
		this.#storage = new IdbStorage();
	}

	static getInstance(): AuthClientProvider {
		if (isNullish(this.#instance)) {
			this.#instance = new AuthClientProvider();
		}

		return this.#instance;
	}

	#buildAuthClient = (signInOptions?: SignInAuthClientOptions): AuthClient =>
		new AuthClient({
			storage: this.#storage,
			idleOptions: {
				disableIdle: true,
				disableDefaultIdleCallback: true
			},
			...signInOptions
		});

	// Kept async even though the constructor is synchronous, so every caller
	// uniformly awaits and the shape matches `safeCreateAuthClient`.
	// eslint-disable-next-line require-await
	createAuthClient = async ({
		forceRecreate
	}: { forceRecreate?: boolean } = {}): Promise<AuthClient> => {
		const authClient = this.#authClient;

		if (forceRecreate !== true && nonNullish(authClient)) {
			return authClient;
		}

		this.#authClient = this.#buildAuthClient();

		return this.#authClient;
	};

	/**
	 * Clears any stored key and delegation before building a fresh client.
	 *
	 * Constructing a new `AuthClient` does not discard an existing delegation —
	 * it pairs whatever delegation is in storage with whatever key is present.
	 * Clearing the key without clearing the delegation would leave the
	 * delegation pointing at a public key that no longer exists, which fails at
	 * signature verification rather than at sign-in.
	 */
	safeCreateAuthClient = async (): Promise<AuthClient> => {
		await Promise.all([
			this.#storage.remove(KEY_STORAGE_KEY),
			this.#storage.remove(KEY_STORAGE_DELEGATION)
		]);

		return await this.createAuthClient({ forceRecreate: true });
	};

	/**
	 * Builds a client bound to one sign-in attempt.
	 *
	 * `identityProvider`, `derivationOrigin`,
	 * `windowOpenerFeatures` and `openIdProvider` are constructor-bound rather
	 * than arguments to `login()`, so each sign-in needs its own client.
	 * Construction stays synchronous so this can be called straight from a
	 * user-gesture handler without tripping popup blockers.
	 */
	createAuthClientForSignIn = (signInOptions: SignInAuthClientOptions): AuthClient => {
		this.#authClient = this.#buildAuthClient(signInOptions);

		return this.#authClient;
	};

	/**
	 * Resolves the current identity, or `undefined` when signed out.
	 *
	 * We read and validate the delegation straight from IndexedDB rather than
	 * calling `AuthClient.isAuthenticated()`, which is synchronous and reads
	 * `localStorage` — unavailable in a worker context.
	 */
	loadIdentity = async (): Promise<Identity | undefined> => {
		if (!(await this.#hasValidDelegation())) {
			return undefined;
		}

		const authClient = await this.createAuthClient();

		return await authClient.getIdentity();
	};

	#hasValidDelegation = async (): Promise<boolean> => {
		const chain = await this.#delegationChain();

		return nonNullish(chain) && isDelegationValid(chain);
	};

	#delegationChain = async (): Promise<DelegationChain | undefined> => {
		const raw = await this.#storage.get(KEY_STORAGE_DELEGATION);

		if (typeof raw !== 'string') {
			return undefined;
		}

		try {
			return DelegationChain.fromJSON(raw);
		} catch {
			return undefined;
		}
	};

	/**
	 * When the current delegation stops being valid, in milliseconds since the
	 * epoch — or `undefined` when there is no delegation to expire.
	 *
	 * The chain is only as good as its earliest-expiring link, so this is the
	 * minimum across the chain rather than the last entry's expiry.
	 */
	delegationExpiration = async (): Promise<number | undefined> => {
		const chain = await this.#delegationChain();

		if (isNullish(chain)) {
			return undefined;
		}

		const expirations = chain.delegations.map(({ delegation: { expiration } }) => expiration);

		if (expirations.length === 0) {
			return undefined;
		}

		const earliest = expirations.reduce((min, value) => (value < min ? value : min));

		// Delegation expiries are nanoseconds; `Date.now()` is milliseconds.
		return Number(earliest / 1_000_000n);
	};

	get storage(): IdbStorage {
		return this.#storage;
	}

	reset() {
		this.#authClient = undefined;
	}
}
