const viteEnv = (): ImportMetaEnv | undefined =>
	typeof import.meta !== 'undefined'
		? (import.meta as ImportMeta & { env?: ImportMetaEnv }).env
		: undefined;

/**
 * A production build deployed to a local network.
 *
 * `vite build` always sets `DEV === false`, so a build deployed locally would
 * otherwise target mainnet and skip `fetchRootKey` — which a local replica
 * needs, since its root key is not the one the agent ships with. Building with
 * `--mode skylab` is what `npm run deploy:local` uses.
 */
export const isSkylab = (): boolean => viteEnv()?.MODE === 'skylab';

export const isDev = (): boolean => viteEnv()?.DEV === true || isSkylab();

export const isProd = (): boolean => viteEnv()?.PROD === true;
