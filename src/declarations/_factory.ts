import { idlFactory as idlFactoryEscrow } from '$declarations/escrow/escrow.idl';

import { idlFactory as idlFactoryCertifiedEscrow } from '$declarations/escrow/escrow.certified.idl';

import type { _SERVICE as EscrowService } from '$declarations/escrow/escrow';

import { idlFactory as idlFactoryProfiles } from '$declarations/profiles/profiles.idl';

import { idlFactory as idlFactoryCertifiedProfiles } from '$declarations/profiles/profiles.certified.idl';

import type { _SERVICE as ProfilesService } from '$declarations/profiles/profiles';

export {
	idlFactoryCertifiedEscrow,
	idlFactoryCertifiedProfiles,
	idlFactoryEscrow,
	idlFactoryProfiles,
	type EscrowService,
	type ProfilesService
};
