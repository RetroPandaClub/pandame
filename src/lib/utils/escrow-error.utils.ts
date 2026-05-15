import { EscrowCanisterError } from '$lib/canisters/escrow.canister';
import { ICP_TOKEN } from '$lib/constants/tokens.constants';
import type { Token } from '$lib/types/token';
import { formatTokenAmount } from '$lib/utils/format.utils';

/**
 * Map known typed `EscrowError` variants to user-facing strings.
 *
 * Falls back to `err.message` so any unmapped variant still surfaces
 * (rather than swallowing the cause). Keep the variant list in sync
 * with the surface documented in `src/declarations/escrow/escrow.did`
 * — adding a new variant in `EscrowDid.EscrowError` will compile here
 * but won't print anything more useful than the raw payload until a
 * mapping is added.
 *
 * `token` is used to render base-unit amounts (`min`) in the deal's
 * settlement asset; defaults to ICP because that is the only
 * settlement token surfaced today.
 */
export const friendlyEscrowError = (
	error: EscrowCanisterError,
	t: I18n,
	token: Token = ICP_TOKEN
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

	if ('UnsupportedAsset' in v) {
		return t.errors.unsupported_asset;
	}

	return error.message;
};
