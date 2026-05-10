<script lang="ts">
	import { signOut } from '@junobuild/core';
	import Button from '$lib/components/Button.svelte';
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

	const onKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape' && open) {
			onclose();
		}
	};
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
	<div
		class="bg-primary-stroke/32 animate-fade fixed inset-0 z-50 flex items-center justify-center p-6"
		role="dialog"
		aria-modal="true"
		aria-label={$i18n.logout_confirm.title}
	>
		<div
			class="bg-bg-elevated text-default shadow-bubble flex h-[161px] w-[302px] flex-col items-center justify-center gap-[14px] rounded-[12px] px-[28px]"
		>
			<h2 class="text-h5 text-default text-center font-sans font-normal">
				{$i18n.logout_confirm.title}
			</h2>

			<div class="flex items-center gap-[12px]">
				<Button size="sm" loading={progress} onclick={confirm}>
					{$i18n.logout_confirm.confirm}
				</Button>
				<Button size="sm" disabled={progress} onclick={onclose}>
					{$i18n.logout_confirm.cancel}
				</Button>
			</div>
		</div>
	</div>
{/if}
