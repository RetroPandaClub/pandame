<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		open: boolean;
		onclose: () => void;
		/**
		 * Called with the user-picked `File` (either from the camera or
		 * from the device library). Parent owns compression + persistence
		 * so the same sheet can drive any avatar host in the future.
		 */
		onpicked: (file: File) => void;
		/** Disables the action buttons while the parent is processing. */
		busy?: boolean;
	}

	let { open, onclose, onpicked, busy = false }: Props = $props();

	let cameraInput: HTMLInputElement | undefined = $state(undefined);
	let libraryInput: HTMLInputElement | undefined = $state(undefined);

	const pick = (input: HTMLInputElement | undefined) => {
		if (busy) {
			return;
		}
		input?.click();
	};

	const handle = (event: Event) => {
		const target = event.currentTarget as HTMLInputElement;
		const file = target.files?.[0];
		// Reset the input so the same file can be picked twice in a row.
		target.value = '';
		if (file === undefined) {
			return;
		}
		onpicked(file);
	};
</script>

<!--
	Two hidden file inputs — one with `capture="user"` so mobile browsers
	open the front camera, one without so they open the photo picker /
	files app. On desktop the `capture` attribute is ignored and both
	fall back to the regular file picker.
-->
<input
	bind:this={cameraInput}
	type="file"
	accept="image/*"
	capture="user"
	class="hidden"
	onchange={handle}
	aria-hidden="true"
	tabindex="-1"
	data-tid="avatar-upload-camera"
/>
<input
	bind:this={libraryInput}
	type="file"
	accept="image/*"
	class="hidden"
	onchange={handle}
	aria-hidden="true"
	tabindex="-1"
	data-tid="avatar-upload-library"
/>

<Modal {open} onclose={busy ? () => {} : onclose} title={$i18n.profile.avatar_sheet_title}>
	<p class="text-muted text-body2">{$i18n.profile.avatar_sheet_description}</p>

	<div class="flex flex-col gap-[10px]">
		<Button
			fullWidth
			disabled={busy}
			loading={busy}
			onclick={() => pick(cameraInput)}
			ariaLabel={$i18n.profile.avatar_take_photo}
		>
			{$i18n.profile.avatar_take_photo}
		</Button>
		<Button
			fullWidth
			variant="secondary"
			disabled={busy}
			onclick={() => pick(libraryInput)}
			ariaLabel={$i18n.profile.avatar_choose_library}
		>
			{$i18n.profile.avatar_choose_library}
		</Button>
	</div>

	{#snippet footer()}
		<Button variant="ghost" disabled={busy} onclick={onclose}>
			{$i18n.profile.edit_cancel}
		</Button>
	{/snippet}
</Modal>
