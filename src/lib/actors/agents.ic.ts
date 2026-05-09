import { REPLICA_HOST } from '$lib/constants/app.constants';
import { isDev } from '$lib/env/app.env';
import { AgentManager } from '@dfinity/utils';

/**
 * Single shared agent manager. Caches one HttpAgent per identity so we don't
 * re-fetch the root key (in dev) on every canister call.
 */
const agents = AgentManager.create({ fetchRootKey: isDev(), host: REPLICA_HOST });

export const { getAgent } = agents;
