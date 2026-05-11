<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		open: boolean;
		onclose: () => void;
		/**
		 * Called with the user-picked `File` (either snapped from the live
		 * webcam preview or chosen from the device library). Parent owns
		 * compression + persistence so the same sheet can drive any avatar
		 * host in the future.
		 */
		onpicked: (file: File) => void;
		/** Disables the action buttons while the parent is processing. */
		busy?: boolean;
	}

	let { open, onclose, onpicked, busy = false }: Props = $props();

	type Mode = 'choose' | 'camera' | 'error';
	let mode: Mode = $state('choose');
	let cameraError: string | undefined = $state(undefined);
	let stream: MediaStream | undefined = $state(undefined);
	let videoEl: HTMLVideoElement | undefined = $state(undefined);
	let cameraReady = $state(false);
	let libraryInput: HTMLInputElement | undefined = $state(undefined);

	const stopCamera = () => {
		if (stream !== undefined) {
			for (const track of stream.getTracks()) {
				track.stop();
			}
			stream = undefined;
		}
		cameraReady = false;
	};

	const resetState = () => {
		stopCamera();
		mode = 'choose';
		cameraError = undefined;
	};

	// External closes (Esc, X, backdrop, parent setting open=false) all
	// route through here so the camera stream is always released.
	$effect(() => {
		if (!open) {
			untrack(resetState);
		}
	});

	// (Re-)attach the live stream to the <video> the first frame after
	// `mode === 'camera'` swaps the conditional and the element mounts.
	$effect(() => {
		if (mode === 'camera' && stream !== undefined && videoEl !== undefined) {
			videoEl.srcObject = stream;
		}
	});

	onDestroy(stopCamera);

	const startCamera = async () => {
		if (busy) {
			return;
		}
		cameraError = undefined;

		if (typeof navigator === 'undefined' || navigator.mediaDevices?.getUserMedia === undefined) {
			cameraError = $i18n.profile.avatar_camera_unsupported;
			mode = 'error';
			return;
		}

		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: 'user',
					width: { ideal: 1280 },
					height: { ideal: 1280 }
				},
				audio: false
			});
			mode = 'camera';
		} catch (err) {
			console.error('Failed to start camera:', err);
			const name = (err as DOMException | undefined)?.name;
			cameraError =
				name === 'NotAllowedError' || name === 'SecurityError'
					? $i18n.profile.avatar_camera_denied
					: $i18n.profile.avatar_camera_unavailable;
			mode = 'error';
		}
	};

	const capture = () => {
		if (videoEl === undefined || stream === undefined) {
			return;
		}
		const w = videoEl.videoWidth;
		const h = videoEl.videoHeight;
		if (w === 0 || h === 0) {
			cameraError = $i18n.profile.avatar_camera_unavailable;
			mode = 'error';
			return;
		}

		// Snap a center-cropped square JPEG from the current frame. The
		// downstream `fileToAvatarDataUrl` does the final resize + size
		// budget so we hand it a generous source resolution.
		const side = Math.min(w, h);
		const sx = (w - side) / 2;
		const sy = (h - side) / 2;
		const canvas = document.createElement('canvas');
		canvas.width = side;
		canvas.height = side;
		const ctx = canvas.getContext('2d');
		if (ctx === null) {
			cameraError = $i18n.profile.avatar_camera_unavailable;
			mode = 'error';
			return;
		}
		ctx.drawImage(videoEl, sx, sy, side, side, 0, 0, side, side);

		canvas.toBlob(
			(blob) => {
				if (blob === null) {
					cameraError = $i18n.profile.avatar_camera_unavailable;
					mode = 'error';
					return;
				}
				const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
				stopCamera();
				mode = 'choose';
				onpicked(file);
			},
			'image/jpeg',
			0.92
		);
	};

	const pickLibrary = () => {
		if (busy) {
			return;
		}
		libraryInput?.click();
	};

	const handleLibrary = (event: Event) => {
		const target = event.currentTarget as HTMLInputElement;
		const file = target.files?.[0];
		// Reset the input so the same file can be picked twice in a row.
		target.value = '';
		if (file === undefined) {
			return;
		}
		onpicked(file);
	};

	const close = () => {
		if (busy) {
			return;
		}
		onclose();
	};
</script>

<input
	bind:this={libraryInput}
	type="file"
	accept="image/*"
	class="hidden"
	onchange={handleLibrary}
	aria-hidden="true"
	tabindex="-1"
	data-tid="avatar-upload-library"
/>

<Modal {open} onclose={close} title={$i18n.profile.avatar_sheet_title}>
	{#if mode === 'camera'}
		<p class="text-muted text-body2">{$i18n.profile.avatar_camera_hint}</p>
		<div class="flex justify-center">
			<video
				bind:this={videoEl}
				autoplay
				playsinline
				muted
				onloadedmetadata={() => (cameraReady = true)}
				class="bg-default/5 aspect-square w-full max-w-[280px] rounded-lg object-cover"
				aria-label={$i18n.profile.avatar_camera_preview_aria}
				data-tid="avatar-camera-preview"
			></video>
		</div>
		<div class="flex flex-col gap-[10px]">
			<Button
				fullWidth
				disabled={busy || !cameraReady}
				loading={busy}
				onclick={capture}
				ariaLabel={$i18n.profile.avatar_capture}
			>
				{$i18n.profile.avatar_capture}
			</Button>
			<Button
				fullWidth
				variant="secondary"
				disabled={busy}
				onclick={resetState}
				ariaLabel={$i18n.profile.avatar_camera_back}
			>
				{$i18n.profile.avatar_camera_back}
			</Button>
		</div>
	{:else if mode === 'error'}
		<p class="text-danger text-body2" role="alert">{cameraError}</p>
		<div class="flex flex-col gap-[10px]">
			<Button
				fullWidth
				variant="secondary"
				disabled={busy}
				onclick={pickLibrary}
				ariaLabel={$i18n.profile.avatar_choose_library}
			>
				{$i18n.profile.avatar_choose_library}
			</Button>
			<Button
				fullWidth
				variant="ghost"
				disabled={busy}
				onclick={() => {
					mode = 'choose';
				}}
				ariaLabel={$i18n.profile.avatar_camera_back}
			>
				{$i18n.profile.avatar_camera_back}
			</Button>
		</div>
	{:else}
		<p class="text-muted text-body2">{$i18n.profile.avatar_sheet_description}</p>
		<div class="flex flex-col gap-[10px]">
			<Button
				fullWidth
				disabled={busy}
				loading={busy}
				onclick={startCamera}
				ariaLabel={$i18n.profile.avatar_take_photo}
			>
				{$i18n.profile.avatar_take_photo}
			</Button>
			<Button
				fullWidth
				variant="secondary"
				disabled={busy}
				onclick={pickLibrary}
				ariaLabel={$i18n.profile.avatar_choose_library}
			>
				{$i18n.profile.avatar_choose_library}
			</Button>
		</div>
	{/if}

	{#snippet footer()}
		<Button variant="ghost" disabled={busy} onclick={close}>
			{$i18n.profile.edit_cancel}
		</Button>
	{/snippet}
</Modal>
