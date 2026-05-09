import juno from '@junobuild/vite-plugin';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), juno({ container: true }), tailwindcss()],
	resolve: {
		alias: {
			$declarations: resolve('./src/declarations'),
			$routes: resolve('./src/routes'),
			$lib: resolve('./src/lib'),
			$root: resolve('./')
		}
	},
	server: {
		fs: {
			allow: ['.']
		}
	},
	worker: {
		plugins: () => [sveltekit()],
		format: 'es'
	}
});
