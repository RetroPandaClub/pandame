import { type ArbitratorStatusName } from '$lib/enums/arbitrator';
import type { Arbitrator, ArbitratorStatus } from '$lib/types/arbitrator';
import { variantKey } from '$lib/utils/variant.utils';
import { fromNullable } from '@dfinity/utils';

export const arbitratorStatus = (
	arbitrator: Pick<Arbitrator, 'status'> | { status: ArbitratorStatus }
): ArbitratorStatusName =>
	variantKey<ArbitratorStatusName>(arbitrator.status as Record<ArbitratorStatusName, unknown>);

export const statusName = (status: ArbitratorStatus): ArbitratorStatusName =>
	variantKey<ArbitratorStatusName>(status as Record<ArbitratorStatusName, unknown>);

const STATUS_BY_NAME: Record<ArbitratorStatusName, ArbitratorStatus> = {
	Active: { Active: null },
	Suspended: { Suspended: null },
	Deregistered: { Deregistered: null }
};

export const statusFromName = (name: ArbitratorStatusName): ArbitratorStatus =>
	STATUS_BY_NAME[name];

/**
 * Reliability score as a 0-100 number, or `undefined` while the
 * arbitrator hasn't accumulated enough scored votes to compute one
 * (`disputes_voted < MIN_VOTES_FOR_SCORE` on the canister).
 */
export const arbitratorScore = (arbitrator: Pick<Arbitrator, 'score'>): number | undefined =>
	fromNullable(arbitrator.score);
