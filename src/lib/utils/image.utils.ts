/**
 * Browser-side helpers for the inline avatar pipeline.
 *
 * The Juno `profiles` collection stores the avatar as a data URL inside
 * the profile document (see `$lib/types/profile.ts`). To keep documents
 * small — well under the 2 MB stable-memory limit and under the
 * 1.5 MB-or-so soft ceiling beyond which Juno responses noticeably
 * slow down — we center-crop, downscale, and JPEG-compress the picked
 * file before storing it. `fileToAvatarDataUrl` is the single entry
 * point; callers don't touch canvases directly.
 */

const DEFAULT_MAX_SIZE = 512;
const DEFAULT_QUALITY = 0.85;
const DEFAULT_MIME = 'image/jpeg';
const ACCEPTED_PREFIX = 'image/';

/** Hard ceiling on the produced base64 payload. ~340 KB raw ≈ 256 KB JPEG. */
export const MAX_AVATAR_DATA_URL_BYTES = 340_000;

export interface AvatarPipelineOptions {
	/** Longest side, in CSS pixels. Defaults to 512 (sharp on 4× DPR). */
	maxSize?: number;
	/** JPEG quality 0..1. Defaults to 0.85 — visually lossless for avatars. */
	quality?: number;
	/** Output mime type. Only `image/jpeg` / `image/webp` make sense here. */
	mimeType?: string;
}

export class AvatarPipelineError extends Error {
	constructor(
		public readonly reason: 'not-an-image' | 'decode-failed' | 'too-large' | 'canvas-unavailable',
		message: string
	) {
		super(message);
		this.name = 'AvatarPipelineError';
	}
}

/**
 * Decode the picked file into a square center-cropped JPEG data URL.
 *
 * Throws `AvatarPipelineError` for the three predictable failure modes
 * (wrong mime, browser couldn't decode, produced payload too big) so
 * callers can branch on `err.reason` for a user-friendly message.
 */
export const fileToAvatarDataUrl = async (
	file: File,
	{
		maxSize = DEFAULT_MAX_SIZE,
		quality = DEFAULT_QUALITY,
		mimeType = DEFAULT_MIME
	}: AvatarPipelineOptions = {}
): Promise<string> => {
	if (!file.type.startsWith(ACCEPTED_PREFIX)) {
		throw new AvatarPipelineError('not-an-image', `Unsupported file type: ${file.type}`);
	}

	const bitmap = await decode(file);
	const dataUrl = renderToDataUrl(bitmap, { maxSize, quality, mimeType });

	if (typeof bitmap.close === 'function') {
		bitmap.close();
	}

	if (dataUrl.length > MAX_AVATAR_DATA_URL_BYTES) {
		throw new AvatarPipelineError(
			'too-large',
			`Encoded avatar is ${dataUrl.length} bytes (>${MAX_AVATAR_DATA_URL_BYTES})`
		);
	}

	return dataUrl;
};

const decode = async (file: File): Promise<ImageBitmap> => {
	if (typeof createImageBitmap !== 'function') {
		throw new AvatarPipelineError('canvas-unavailable', 'createImageBitmap is not available');
	}
	try {
		return await createImageBitmap(file);
	} catch (err) {
		throw new AvatarPipelineError(
			'decode-failed',
			`Browser could not decode ${file.type}: ${(err as Error).message ?? 'unknown error'}`
		);
	}
};

const renderToDataUrl = (
	bitmap: ImageBitmap,
	{ maxSize, quality, mimeType }: Required<AvatarPipelineOptions>
): string => {
	const side = Math.min(bitmap.width, bitmap.height);
	const sx = (bitmap.width - side) / 2;
	const sy = (bitmap.height - side) / 2;
	const dim = Math.min(side, maxSize);

	const canvas = document.createElement('canvas');
	canvas.width = dim;
	canvas.height = dim;
	const ctx = canvas.getContext('2d');
	if (ctx === null) {
		throw new AvatarPipelineError('canvas-unavailable', '2D canvas context is unavailable');
	}
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, dim, dim);

	return canvas.toDataURL(mimeType, quality);
};
