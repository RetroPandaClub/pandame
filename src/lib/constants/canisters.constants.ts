import { Principal } from '@icp-sdk/core/principal';

const viteEnvString = (key: string): string | undefined => {
	if (typeof import.meta === 'undefined') {
		return;
	}

	return (import.meta as ImportMeta & { env?: Record<string, string> }).env?.[key];
};

// Mainnet escrow canister; `npm run dev:setup` overrides via `.env.local`.
const ESCROW_CANISTER_ID_DEFAULT = 'umxj5-niaaa-aaaae-af2sq-cai';

export const ESCROW_CANISTER_ID = Principal.fromText(
	viteEnvString('VITE_ESCROW_CANISTER_ID') ?? ESCROW_CANISTER_ID_DEFAULT
);

// Mainnet ICP ledger. The Juno emulator pre-installs the same ID, so
// no override is needed for local dev.
const ICP_LEDGER_CANISTER_ID_DEFAULT = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

export const ICP_LEDGER_CANISTER_ID =
	viteEnvString('VITE_ICP_LEDGER_CANISTER_ID') ?? ICP_LEDGER_CANISTER_ID_DEFAULT;

// Test ICP ledger from https://github.com/dfinity/ledger-faucet — a
// mainnet-deployed clone of the ICP ledger backed by a faucet so
// deployed satellites can exercise the full escrow + ICRC-2 flow
// without moving real ICP.
const TESTICP_LEDGER_CANISTER_ID_DEFAULT = 'xafvr-biaaa-aaaai-aql5q-cai';

export const TESTICP_LEDGER_CANISTER_ID =
	viteEnvString('VITE_TESTICP_LEDGER_CANISTER_ID') ?? TESTICP_LEDGER_CANISTER_ID_DEFAULT;
