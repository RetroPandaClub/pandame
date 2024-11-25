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

		// Mobile
		{
			name: 'Apple iPhone SE',
			use: { ...devices['iPhone SE'] }
		},
		{
			name: 'Apple iPhone 14 Pro Max',
			use: { ...devices['iPhone SE'] }
		},
		{
			name: 'Samsung Galaxy S8',
			use: { ...devices['Galaxy S8'] }
		},
		{
			name: 'Google Pixel 7',
			use: { ...devices['Pixel 7'] }
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
