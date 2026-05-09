import { Principal } from '@icp-sdk/core/principal';

const viteEnvString = (key: string): string | undefined => {
	if (typeof import.meta === 'undefined') {
		return;
	}

	return (import.meta as ImportMeta & { env?: Record<string, string> }).env?.[key];
};

/**
 * Standalone Escrow Rust canister.
 *
 * Mainnet (staging subnet): `umxj5-niaaa-aaaae-af2sq-cai`. Source of truth
 * for the production ID is `../escrow/canister_ids.json`; bump in lockstep
 * with the upstream repo.
 *
 * For local development, `npm run dev:setup` deploys escrow into the Juno
 * emulator's replica with a freshly-assigned ID and writes it to
 * `.env.local` as `VITE_ESCROW_CANISTER_ID`. That override wins over the
 * mainnet default when present.
 */
const ESCROW_CANISTER_ID_DEFAULT = 'umxj5-niaaa-aaaae-af2sq-cai';

export const ESCROW_CANISTER_ID = Principal.fromText(
	viteEnvString('VITE_ESCROW_CANISTER_ID') ?? ESCROW_CANISTER_ID_DEFAULT
);

/**
 * ICP ledger (NNS, mainnet). The default settlement token for v1.
 *
 * The Juno emulator's Skylab image pre-installs an ICP ledger at the same
 * canonical canister ID used on mainnet, so no env override is needed for
 * local development. If a future Juno image changes that, set
 * `VITE_ICP_LEDGER_CANISTER_ID` in `.env.local`.
 */
const ICP_LEDGER_CANISTER_ID_DEFAULT = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

export const ICP_LEDGER_CANISTER_ID =
	viteEnvString('VITE_ICP_LEDGER_CANISTER_ID') ?? ICP_LEDGER_CANISTER_ID_DEFAULT;
