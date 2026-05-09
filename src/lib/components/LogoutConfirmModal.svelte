<script lang="ts">
	import { signOut } from '@junobuild/core';
	import Button from '$lib/components/Button.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		open: boolean;
		onclose?: () => void;
	}

	let { open, onclose = () => {} }: Props = $props();

	let progress = $state(false);

	const confirm = async () => {
		progress = true;
		try {
			await signOut();
		} catch (err) {
			console.error('signOut failed:', err);
		} finally {
			progress = false;
			onclose();
		}
	};
</script>

<Modal {open} {onclose} title={$i18n.logout_confirm.title}>
	<p class="text-body1 text-default">{$i18n.logout_confirm.description}</p>

	{#snippet footer()}
		<Button variant="ghost" disabled={progress} onclick={onclose}>
			{$i18n.logout_confirm.cancel}
		</Button>
		<Button variant="primary" loading={progress} onclick={confirm}>
			{$i18n.logout_confirm.confirm}
		</Button>
	{/snippet}
</Modal>
