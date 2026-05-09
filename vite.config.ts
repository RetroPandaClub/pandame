import juno from '@junobuild/vite-plugin';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), juno(), tailwindcss()],
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
		},
		// Forward IC HTTP gateway calls to the local Juno emulator's replica.
		// The browser-side agent dials `window.location.origin` in dev (see
		// `REPLICA_HOST` in `$lib/constants/app.constants.ts`), so its
		// `/api/v2/...` requests must be proxied here. Mirrors the vici-app
		// pattern; without it the agent ends up calling the SvelteKit dev
		// server, which 404s every canister request.
		proxy: {
			'/api': {
				target: 'http://localhost:5987',
				changeOrigin: true
			}
		}
	},
	worker: {
		plugins: () => [sveltekit()],
		format: 'es'
	}
});
