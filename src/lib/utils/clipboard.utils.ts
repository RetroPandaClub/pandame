/**
 * Write `text` to the system clipboard via `navigator.clipboard`. Returns
 * `true` on success, `false` if the platform refused (denied permission,
 * insecure context, missing API). Browser-only — call from event handlers
 * (which never run on the server).
 *
 * The helper deliberately stops at the I/O boundary: timing the visual
 * "Copied!" feedback is the caller's responsibility, because durations
 * differ per surface (~1.5 s on the principal badge, ~2 s on the share
 * link modal, etc.).
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
	if (typeof navigator === 'undefined' || navigator.clipboard === undefined) {
		console.error('Clipboard API unavailable in this context.');
		return false;
	}

	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (err) {
		console.error('Failed to copy to clipboard:', err);
		return false;
	}
};
