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

<!--
  Translucent `rgba(99,42,232,0.32)` brand-purple backdrop covering
  the whole device frame (the Figma "logout confirm" frame washes
  the page in 32 % primary-stroke, not a solid dark fill). Centred
  white `rounded-[12px]` card (302 px wide, 161 px tall, ~25 px
  vertical padding) with a subtle `0 4px 2px rgba(0,0,0,0.25)`
  drop. Heading is Poppins Regular `text-h5` (≈ 25 px) Blu Night;
  the two CTAs are BOTH filled purple `<Button size="sm">` sitting
  in a single row with `gap-[12px]`.
-->
{#if open}
	<div
		class="animate-fade fixed inset-0 z-50 flex items-center justify-center bg-[rgba(99,42,232,0.32)] p-6"
		role="dialog"
		aria-modal="true"
		aria-label={$i18n.logout_confirm.title}
	>
		<div
			class="bg-bg-elevated text-default flex h-[161px] w-[302px] flex-col items-center justify-center gap-[14px] rounded-[12px] px-[28px] shadow-[0_4px_2px_rgba(0,0,0,0.25)]"
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
