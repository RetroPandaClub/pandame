<script lang="ts">
	import type { Snippet } from 'svelte';
	import Backdrop from '$lib/components/Backdrop.svelte';

	interface Props {
		open: boolean;
		onclose?: () => void;
		title?: string;
		children: Snippet;
		footer?: Snippet;
	}

	let { open, onclose = () => {}, title, children, footer }: Props = $props();

	const onKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			onclose();
		}
	};
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
	<div
		class="animate-fade fixed inset-0 z-50 flex items-center justify-center p-4 md:p-16"
		role="dialog"
		aria-modal="true"
		aria-label={title}
	>
		<div
			class="dark:border-primary relative z-10 w-full max-w-xl rounded-sm border-[3px] border-black bg-white p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:bg-black dark:text-white dark:shadow-[8px_8px_0px_#632AE8]"
		>
			{#if title !== undefined}
				<header class="mb-4 flex items-center justify-between">
					<h2 class="text-xl font-bold">{title}</h2>
					<button
						type="button"
						aria-label="Close"
						onclick={onclose}
						class="hover:text-primary active:text-primary/80"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							height="20"
							width="20"
							viewBox="0 -960 960 960"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								d="m252-192-60-60 228-228-228-228 60-60 228 228 228-228 60 60-228 228 228 228-60 60-228-228-228 228Z"
							/>
						</svg>
					</button>
				</header>
			{/if}

			<div class="space-y-4">
				{@render children()}
			</div>

			{#if footer}
				<footer class="mt-6 flex items-center justify-end gap-2">
					{@render footer()}
				</footer>
			{/if}
		</div>
	</div>

	<Backdrop />
{/if}
