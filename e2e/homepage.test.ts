import { expect, test } from '@playwright/test';

test('should display homepage', async ({ page }) => {
	await page.goto('/');

	await expect(page).toHaveScreenshot();
});
