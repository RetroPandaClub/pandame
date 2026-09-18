import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

/**
 * The canister IDs `icp` records when it deploys, so a build carries the real
 * ones instead of a hard-coded guess.
 *
 * `.env.local` still wins — a fresh local network assigns new IDs every time —
 * which is why this only fills in what is not already set.
 */
const canisterIdsFromMapping = (mode: string): Record<string, string> => {
	// Everything that is not an explicit local build targets mainnet.
	const environment = mode === 'development' || mode === 'skylab' ? 'local' : 'ic';

	try {
		const mapping: Record<string, string> = JSON.parse(
			readFileSync(resolve(`.icp/data/mappings/${environment}.ids.json`), 'utf-8')
		);

		return Object.fromEntries(
			Object.entries(mapping).map(([name, id]) => [
				`import.meta.env.VITE_${name.toUpperCase()}_CANISTER_ID`,
				JSON.stringify(id)
			])
		);
	} catch {
		// No mapping yet (nothing deployed to that environment). The constants
		// module throws with a clearer message than a missing-file trace.
		return {};
	}
};

export default defineConfig(({ mode }) => ({
	plugins: [sveltekit(), tailwindcss()],
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
		// Forward IC HTTP gateway calls to the local replica.
		// The browser-side agent dials `window.location.origin` in dev (see
		// `REPLICA_HOST` in `$lib/constants/app.constants.ts`), so its
		// `/api/v2/...` requests must be proxied here. Without it the agent
		// ends up calling the SvelteKit dev server, which 404s every
		// canister request.
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
	},
	define: canisterIdsFromMapping(mode)
}));
