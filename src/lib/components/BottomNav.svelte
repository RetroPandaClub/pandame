<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		left?: Snippet;
		right?: Snippet;
		center?: Snippet;
		ariaLabel?: string;
	}

	let { left, right, center, ariaLabel = 'Primary navigation' }: Props = $props();
</script>

<nav
	class="border-border-soft bg-bg sticky bottom-0 z-30 mt-auto border-t pb-[env(safe-area-inset-bottom)]"
	aria-label={ariaLabel}
>
	<div class="relative flex h-16 items-center justify-between px-10">
		<div class="flex items-center">
			{#if left}{@render left()}{/if}
		</div>

		<div class="flex items-center">
			{#if right}{@render right()}{/if}
		</div>

		{#if center}
			<div class="absolute -top-7 left-1/2 -translate-x-1/2">
				{@render center()}
			</div>
		{/if}
	</div>
</nav>
