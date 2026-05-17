// Browser-only — must be called from an event handler. Caller owns
// the "Copied!" timing because durations differ per surface.
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
