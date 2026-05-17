import { defineConfig, devices } from '@playwright/test';

const DEV = (process.env.NODE_ENV ?? 'production') === 'development';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},

	testDir: 'e2e',

	use: {
		testIdAttribute: 'data-tid',
		trace: 'on',
		...(DEV && { headless: false })
	},

	projects: [
		// Desktop
		{
			name: 'Google Chrome',
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'Mozilla Firefox',
			use: { ...devices['Desktop Firefox'] }
		},
		{
			name: 'Microsoft Edge',
			use: { ...devices['Desktop Edge'] }
		},
		{
			name: 'Apple Safari',
			use: { ...devices['Desktop Safari'] }
		},

		// Mobile — explicit screen/viewport so phone-frame layout assertions
		// stay deterministic across Playwright bumps.
		{
			name: 'Apple iPhone 15 Pro Max',
			use: {
				...devices['iPhone 15 Pro Max'],
				screen: { width: 430, height: 932 },
				viewport: { width: 430, height: 932 }
			}
		},
		{
			name: 'Apple iPhone 13 Mini',
			use: {
				...devices['iPhone 13 Mini'],
				screen: { width: 375, height: 812 },
				viewport: { width: 375, height: 812 }
			}
		},
		{
			name: 'Samsung Galaxy S24',
			use: {
				...devices['Galaxy S24'],
				screen: { width: 360, height: 780 },
				viewport: { width: 360, height: 780 }
			}
		},

		// Tablets
		{
			name: 'Apple iPad (gen 7)',
			use: { ...devices['iPad (gen 7)'] }
		},
		{
			name: 'Apple iPad Pro 11',
			use: { ...devices['iPad Pro 11'] }
		}
	]
});
