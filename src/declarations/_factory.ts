import { idlFactory as idlFactoryEscrow } from '$declarations/escrow/escrow.idl';

import { idlFactory as idlFactoryCertifiedEscrow } from '$declarations/escrow/escrow.certified.idl';

import type { _SERVICE as EscrowService } from '$declarations/escrow/escrow';

export { idlFactoryCertifiedEscrow, idlFactoryEscrow, type EscrowService };
