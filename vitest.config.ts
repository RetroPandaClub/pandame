import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(
	(): UserConfig => ({
		plugins: [sveltekit()],
		test: {
			globals: true,
			environment: 'jsdom',
			include: ['./src/**/*.{test,spec}.?(c|m)[jt]s?(x)']
		}
	})
);
