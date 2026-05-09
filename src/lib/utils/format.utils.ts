import { MILLISECOND_IN_NANOSECONDS } from '$lib/constants/app.constants';
import type { Token } from '$lib/types/token';
import { Principal } from '@icp-sdk/core/principal';

/**
 * Convert a base-unit token amount (e.g. e8s for ICP) to a human string with
 * `decimals` digits of fractional precision, trailing zeros trimmed.
 */
export const formatTokenAmount = (amount_e8s: bigint, { decimals, symbol }: Token): string => {
	const negative = amount_e8s < 0n;
	const abs = negative ? -amount_e8s : amount_e8s;

	const factor = 10n ** BigInt(decimals);
	const whole = abs / factor;
	const fraction = abs % factor;

	const fractionStr =
		fraction === 0n ? '' : `.${fraction.toString().padStart(decimals, '0').replace(/0+$/, '')}`;

	const sign = negative ? '-' : '';
	const value = `${sign}${whole.toString()}${fractionStr}`;

	return `${value} ${symbol}`;
};

/**
 * Parse a user-typed amount (e.g. `"0.05"`) into base units. Returns
 * `undefined` for invalid input so the caller can surface a validation
 * error instead of crashing on `BigInt("NaN")`.
 */
export const parseTokenAmount = (input: string, { decimals }: Token): bigint | undefined => {
	const trimmed = input.trim();

	if (trimmed.length === 0) {
		return undefined;
	}

	if (!/^\d+(\.\d+)?$/.test(trimmed)) {
		return undefined;
	}

	const [whole, fraction = ''] = trimmed.split('.');
	const padded = (fraction + '0'.repeat(decimals)).slice(0, decimals);

	try {
		return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(padded || '0');
	} catch {
		return undefined;
	}
};

/**
 * Convert a nanosecond IC timestamp (`expires_at_ns`, `created_at_ns`, …)
 * into a JavaScript `Date` (millisecond precision, lossy for sub-ms data).
 */
export const nsToDate = (ns: bigint): Date => new Date(Number(ns / MILLISECOND_IN_NANOSECONDS));

/**
 * Convert a JavaScript `Date` (or `number` ms) into nanoseconds.
 */
export const msToNs = (input: Date | number): bigint => {
	const ms = typeof input === 'number' ? input : input.getTime();

	return BigInt(ms) * MILLISECOND_IN_NANOSECONDS;
};

/**
 * Render a principal as the standard `xxxxx-...-xxxxx` short form (first
 * + last 5 chars). Falls back to the full text when the principal already
 * fits in the budget.
 */
export const shortPrincipal = (principal: Principal | string): string => {
	const text = principal instanceof Principal ? principal.toText() : principal;

	if (text.length <= 13) {
		return text;
	}

	return `${text.slice(0, 5)}…${text.slice(-5)}`;
};
