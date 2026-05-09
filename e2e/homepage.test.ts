import { expect, test } from '@playwright/test';

test('renders the logged-out homepage', async ({ page }) => {
	await page.goto('/');

	// Brand chrome is up — proves the page bootstrapped and i18n loaded.
	await expect(page.getByRole('heading', { level: 1, name: 'PandaMe' })).toBeVisible();

	// Auth.svelte rendered the logged-out path — proves the Juno SDK
	// initialized far enough for `userSignedIn` to evaluate to `false`.
	await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});
