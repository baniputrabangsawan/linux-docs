import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: 'tests/dev-e2e',
	fullyParallel: false,
	retries: 0,
	timeout: 30_000,
	use: {
		baseURL: 'http://127.0.0.1:4331',
		trace: 'retain-on-failure',
	},
	webServer: {
		command: 'npx astro dev --host 127.0.0.1 --port 4331; npx astro dev logs --follow',
		url: 'http://127.0.0.1:4331',
		reuseExistingServer: true,
		timeout: 120_000,
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
		},
	],
});
