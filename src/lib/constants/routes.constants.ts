/**
 * Public claim path for the share-link / QR flow.
 * Resolves to `/claim/{deal_id}?code={claim_code}`.
 */
export const CLAIM_ROUTE = (deal_id: bigint, claim_code: string): string =>
	`/claim/${deal_id}?code=${encodeURIComponent(claim_code)}`;

/**
 * Absolute URL for sharing — uses `window.location.origin` so links work
 * across staging / production satellite hosts without hard-coded domains.
 */
export const SHARE_URL = (deal_id: bigint, claim_code: string): string => {
	if (typeof window === 'undefined') {
		return CLAIM_ROUTE(deal_id, claim_code);
	}

	return `${window.location.origin}${CLAIM_ROUTE(deal_id, claim_code)}`;
};
