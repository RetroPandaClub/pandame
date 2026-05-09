import { ICP_TOKEN } from '$lib/constants/tokens.constants';
import {
	formatTokenAmount,
	msToNs,
	nsToDate,
	parseTokenAmount,
	shortPrincipal
} from '$lib/utils/format.utils';
import { Principal } from '@icp-sdk/core/principal';
import { describe, expect, it } from 'vitest';

describe('format.utils', () => {
	describe('formatTokenAmount', () => {
		it('formats whole units', () => {
			expect(formatTokenAmount(100_000_000n, ICP_TOKEN)).toBe('1 ICP');
		});

		it('formats fractional units and trims trailing zeros', () => {
			expect(formatTokenAmount(150_000_000n, ICP_TOKEN)).toBe('1.5 ICP');
			expect(formatTokenAmount(123_456_780n, ICP_TOKEN)).toBe('1.2345678 ICP');
		});

		it('formats zero', () => {
			expect(formatTokenAmount(0n, ICP_TOKEN)).toBe('0 ICP');
		});

		it('formats negative amounts', () => {
			expect(formatTokenAmount(-50_000_000n, ICP_TOKEN)).toBe('-0.5 ICP');
		});
	});

	describe('parseTokenAmount', () => {
		it('parses whole numbers', () => {
			expect(parseTokenAmount('1', ICP_TOKEN)).toBe(100_000_000n);
		});

		it('parses fractional input up to the token decimals', () => {
			expect(parseTokenAmount('1.5', ICP_TOKEN)).toBe(150_000_000n);
			expect(parseTokenAmount('0.00000001', ICP_TOKEN)).toBe(1n);
		});

		it('truncates input beyond the token decimals', () => {
			// 1.234567899 → 1.23456789 (8 decimals for ICP)
			expect(parseTokenAmount('1.234567899', ICP_TOKEN)).toBe(123_456_789n);
		});

		it('returns undefined for invalid input', () => {
			expect(parseTokenAmount('', ICP_TOKEN)).toBeUndefined();
			expect(parseTokenAmount('abc', ICP_TOKEN)).toBeUndefined();
			expect(parseTokenAmount('1.2.3', ICP_TOKEN)).toBeUndefined();
			expect(parseTokenAmount('-1', ICP_TOKEN)).toBeUndefined();
		});
	});

	describe('nsToDate / msToNs', () => {
		it('round-trips ms ↔ ns', () => {
			const date = new Date('2026-01-01T00:00:00.000Z');
			expect(nsToDate(msToNs(date)).toISOString()).toBe(date.toISOString());
		});

		it('accepts a numeric ms input', () => {
			const ms = 1_700_000_000_000;
			expect(msToNs(ms)).toBe(BigInt(ms) * 1_000_000n);
		});
	});

	describe('shortPrincipal', () => {
		it('shortens long principal text', () => {
			const text = 'aaaaa-bbbbb-ccccc-ddddd-eee';
			expect(shortPrincipal(text)).toBe('aaaaa…d-eee');
		});

		it('returns short principals unchanged', () => {
			expect(shortPrincipal('2vxsx-fae')).toBe('2vxsx-fae');
		});

		it('accepts a Principal instance', () => {
			expect(shortPrincipal(Principal.anonymous())).toBe('2vxsx-fae');
		});
	});
});
