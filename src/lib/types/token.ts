import type { CanisterIdText } from '$lib/types/canister';

export interface Token {
	symbol: string;
	name: string;
	decimals: number;
	/**
	 * ICRC ledger fee in base units (e8s for ICP). Required for the payer's
	 * `icrc2_approve` headroom before the canister calls `transfer_from`.
	 */
	fee: bigint;
	ledgerCanisterId: CanisterIdText;
}
