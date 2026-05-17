import {
	ICP_LEDGER_CANISTER_ID,
	TESTICP_LEDGER_CANISTER_ID
} from '$lib/constants/canisters.constants';
import type { Token } from '$lib/types/token';

/**
 * The genuine ICP token (mainnet ledger). Imported directly only by
 * specs that assert ICP-shaped math; production code reaches for
 * {@link SETTLEMENT_TOKEN} instead so deployed builds don't trade
 * real ICP through escrow.
 */
export const ICP_TOKEN: Token = {
	symbol: 'ICP',
	name: 'Internet Computer',
	decimals: 8,
	fee: 10_000n,
	ledgerCanisterId: ICP_LEDGER_CANISTER_ID
};

/**
 * TESTICP — faucet-minted clone of ICP with the same decimals / fee.
 * See `TESTICP_LEDGER_CANISTER_ID` for the upstream faucet repo.
 */
export const TESTICP_TOKEN: Token = {
	symbol: 'TESTICP',
	name: 'Test ICP',
	decimals: 8,
	fee: 10_000n,
	ledgerCanisterId: TESTICP_LEDGER_CANISTER_ID
};

/**
 * Default settlement token for v1 escrow deals. Resolves to
 * {@link ICP_TOKEN} under `vite dev` / `vitest` (the Juno emulator
 * pre-installs the mainnet ICP ledger under its real id locally, so
 * dev + tests exercise real ICP shapes) and to {@link TESTICP_TOKEN}
 * in any built artifact, so deployed satellites can't move real ICP.
 */
export const SETTLEMENT_TOKEN: Token = import.meta.env.DEV ? ICP_TOKEN : TESTICP_TOKEN;

/**
 * Tokens supported as escrow settlement assets, in display order.
 */
export const SUPPORTED_TOKENS: readonly Token[] = [SETTLEMENT_TOKEN];
