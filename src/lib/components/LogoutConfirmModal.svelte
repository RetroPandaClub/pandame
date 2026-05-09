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
  Figma `281:1411` "Logout confirm":
    - Backdrop: solid dark-purple `#3B2370`-ish covering the whole
      device frame.
    - Modal: small white rounded card centered, padding ~24px.
    - Heading "Are You Sure?" Poppins Regular ~20px Blu Night.
    - Two buttons side-by-side, BOTH filled purple `rounded-button`
      (~80 × 30 px each).
-->
{#if open}
	<div
		class="bg-bg-inverse animate-fade fixed inset-0 z-50 flex items-center justify-center p-6"
		role="dialog"
		aria-modal="true"
		aria-label={$i18n.logout_confirm.title}
		style="background-color: #3B2370;"
	>
		<div
			class="bg-bg-elevated text-default flex w-full max-w-[280px] flex-col items-center gap-[18px] rounded-[16px] px-[28px] py-[24px] shadow-2xl"
		>
			<h2 class="text-h6 text-default font-sans font-normal">
				{$i18n.logout_confirm.title}
			</h2>

			<div class="flex items-center gap-[16px]">
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
