const viteEnv = (): ImportMetaEnv | undefined =>
	typeof import.meta !== 'undefined'
		? (import.meta as ImportMeta & { env?: ImportMetaEnv }).env
		: undefined;

export const isDev = (): boolean => viteEnv()?.DEV === true;

export const isProd = (): boolean => viteEnv()?.PROD === true;
