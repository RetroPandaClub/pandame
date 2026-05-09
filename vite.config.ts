import juno from '@junobuild/vite-plugin';
import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), juno({ container: true })],
	resolve: {
		alias: {
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
	optimizeDeps: {
		esbuildOptions: {
			define: {
				global: 'globalThis'
			},
			plugins: [
				{
					name: 'fix-node-globals-polyfill',
					setup(build) {
						build.onResolve({ filter: /_virtual-process-polyfill_\.js/ }, ({ path }) => ({ path }));
					}
				}
			]
		}
	},
	worker: {
		plugins: () => [sveltekit()],
		format: 'es'
	}
});
