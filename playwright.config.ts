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
		{
			name: 'Google Chrome',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});
