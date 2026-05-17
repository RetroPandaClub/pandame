import { EscrowCanisterError } from '$lib/canisters/escrow.canister';
import { SETTLEMENT_TOKEN } from '$lib/constants/tokens.constants';
import type { Token } from '$lib/types/token';
import { formatTokenAmount } from '$lib/utils/format.utils';

// Falls back to `err.message` so a new variant still surfaces — adding
// one will compile but render the raw payload until a mapping is added.
export const friendlyEscrowError = (
	error: EscrowCanisterError,
	t: I18n,
	token: Token = SETTLEMENT_TOKEN
): string => {
	const v = error.variant;

	if ('PanelSizeOutOfRange' in v) {
		return t.errors.panel_size_out_of_range
			.replace('{got}', String(v.PanelSizeOutOfRange.got))
			.replace('{min}', String(v.PanelSizeOutOfRange.min))
			.replace('{max}', String(v.PanelSizeOutOfRange.max));
	}

	if ('AmountBelowMinimum' in v) {
		return t.errors.amount_below_minimum.replace(
			'{min}',
			formatTokenAmount(v.AmountBelowMinimum.min, token)
		);
	}

	if ('DisputeReserveRequired' in v) {
		return t.errors.dispute_reserve_required;
	}

	if ('CreationFeeRequired' in v) {
		return t.errors.creation_fee_required;
	}

	if ('UnsupportedAsset' in v) {
		return t.errors.unsupported_asset;
	}

	return error.message;
};
