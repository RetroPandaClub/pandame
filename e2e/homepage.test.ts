import { expect, test } from '@playwright/test';

test('renders the logged-out welcome screen', async ({ page }) => {
	await page.goto('/');

	// Brand chrome is up — the welcome heading interpolates the brand name,
	// so a substring match keeps this assertion robust against copy tweaks.
	await expect(page.getByRole('heading', { level: 1 })).toContainText('PandaMe');

	// Auth.svelte rendered the logged-out path — proves the Juno SDK
	// initialised far enough for `userSignedIn` to evaluate to `false`.
	await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});
