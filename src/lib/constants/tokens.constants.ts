import { ICP_LEDGER_CANISTER_ID } from '$lib/constants/canisters.constants';
import type { Token } from '$lib/types/token';

/**
 * ICP token. Default settlement token for v1 escrow deals.
 */
export const ICP_TOKEN: Token = {
	symbol: 'ICP',
	name: 'Internet Computer',
	decimals: 8,
	fee: 10_000n,
	ledgerCanisterId: ICP_LEDGER_CANISTER_ID
};

/**
 * Tokens supported as escrow settlement assets, in display order.
 */
export const SUPPORTED_TOKENS: readonly Token[] = [ICP_TOKEN];
