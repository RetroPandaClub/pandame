import { defineConfig } from 'vitest/config';
import type { UserConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig(
	(): UserConfig => ({
		plugins: [sveltekit()],
		test: {
			globals: true,
			environment: 'jsdom',
			setupFiles: ['./vitest.setup.ts']
		}
	})
);
