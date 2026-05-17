// `bubbles: true` so `<svelte:window on{Message}>` listeners catch
// events dispatched on `document`.
export const emit = <T>({ message, detail }: { message: string; detail?: T | undefined }): void => {
	if (typeof document === 'undefined') {
		return;
	}

	document.dispatchEvent(new CustomEvent<T | undefined>(message, { detail, bubbles: true }));
};
