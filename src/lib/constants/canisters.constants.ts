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
