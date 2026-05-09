import { beforeEach, describe, expect, it, vi } from 'vitest';
import { del, get, set } from './storage.utils';

// Hoisted mock — `vi.mock` is hoisted to the top of the file by the
// vitest transformer, so calls inside `it(...)` were silently merged
// (last write wins) and would become a runtime error in vitest 5+.
vi.mock('$app/environment', () => ({ browser: true }));

const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

const consoleErrorSpy = vi.spyOn(console, 'error');

const key = 'testKey';
const value = 'testValue';

const error = new Error('Mock storage error');

describe('set', () => {
	beforeEach(() => {
		localStorage.clear();
		consoleErrorSpy.mockClear();
	});

	it('should store the value in localStorage as a JSON string', () => {
		set({ key, value });

		expect(setItemSpy).toHaveBeenCalledTimes(1);
		expect(setItemSpy).toHaveBeenCalledWith(key, JSON.stringify(value));
		expect(localStorage.getItem(key)).toBe(JSON.stringify(value));
	});

	it('should catch and log an error if localStorage.setItem throws', () => {
		setItemSpy.mockImplementationOnce(() => {
			throw error;
		});

		consoleErrorSpy.mockImplementationOnce(() => {});

		set({ key, value });

		expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
		expect(consoleErrorSpy).toHaveBeenCalledWith(error);
	});
});

describe('del', () => {
	beforeEach(() => {
		localStorage.clear();
		consoleErrorSpy.mockClear();
	});

	it('should remove the value from localStorage', () => {
		localStorage.setItem(key, value);

		del({ key });

		expect(removeItemSpy).toHaveBeenCalledTimes(1);
		expect(removeItemSpy).toHaveBeenCalledWith(key);
		expect(localStorage.getItem(key)).toBeNull();
	});

	it('should not throw an error if the key does not exist', () => {
		expect(() => del({ key })).not.toThrow();
	});

	it('should catch and log an error if localStorage.removeItem throws', () => {
		removeItemSpy.mockImplementationOnce(() => {
			throw error;
		});

		consoleErrorSpy.mockImplementationOnce(() => {});

		del({ key });

		expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
		expect(consoleErrorSpy).toHaveBeenCalledWith(error);
	});
});

describe('get', () => {
	beforeEach(() => {
		localStorage.clear();
		consoleErrorSpy.mockClear();
	});

	it('should return parsed value when key exists in localStorage', () => {
		localStorage.setItem(key, JSON.stringify(value));

		expect(get({ key })).toEqual(value);
	});

	it('should return undefined when key does not exist in localStorage', () => {
		expect(get({ key })).toBeUndefined();
	});

	it('should return undefined and log an error if JSON parsing fails', () => {
		JSON.parse = vi.fn().mockImplementationOnce(() => {
			throw error;
		});

		consoleErrorSpy.mockImplementationOnce(() => {});

		localStorage.setItem(key, value);

		expect(get({ key })).toBeUndefined();
		expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
		expect(consoleErrorSpy).toHaveBeenCalledWith(error);
	});
});
