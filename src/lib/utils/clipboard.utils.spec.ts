import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { copyToClipboard } from './clipboard.utils';

const consoleErrorSpy = vi.spyOn(console, 'error');

describe('copyToClipboard', () => {
	beforeEach(() => {
		consoleErrorSpy.mockClear();
		consoleErrorSpy.mockImplementation(() => {});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('returns true and writes the text via navigator.clipboard.writeText', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal('navigator', { clipboard: { writeText } });

		await expect(copyToClipboard('hello')).resolves.toBe(true);

		expect(writeText).toHaveBeenCalledTimes(1);
		expect(writeText).toHaveBeenCalledWith('hello');
		expect(consoleErrorSpy).not.toHaveBeenCalled();
	});

	it('returns false and logs when writeText rejects', async () => {
		const error = new Error('denied');
		const writeText = vi.fn().mockRejectedValue(error);
		vi.stubGlobal('navigator', { clipboard: { writeText } });

		await expect(copyToClipboard('hello')).resolves.toBe(false);

		expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
		expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy to clipboard:', error);
	});

	it('returns false and logs when the Clipboard API is missing', async () => {
		vi.stubGlobal('navigator', {});

		await expect(copyToClipboard('hello')).resolves.toBe(false);

		expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
		expect(consoleErrorSpy).toHaveBeenCalledWith('Clipboard API unavailable in this context.');
	});
});
