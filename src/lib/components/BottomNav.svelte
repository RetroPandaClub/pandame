<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		left?: Snippet;
		right?: Snippet;
		/**
		 * The raised centre button. Rendered inside a circular white
		 * floating frame that breaks out the top of the nav.
		 */
		center?: Snippet;
		ariaLabel?: string;
	}

	let { left, right, center, ariaLabel = 'Primary navigation' }: Props = $props();
</script>

<!--
  White card with `rounded-t-bottom-nav` (14 px) corners, ambient
  `shadow-bottom-nav` lift, two side icons + a raised circular
  centre button (75 × 75) breaking out the top edge with a double
  drop-shadow. Per Figma, the side icons live in a 244 px-wide row
  with a 160 px gap (so they sit tight to the raised home button)
  centred inside the nav, and the home button overhangs the top
  edge by 38 px (≈ half its diameter).
-->
<nav
	class="bg-bg-elevated rounded-t-bottom-nav shadow-bottom-nav sticky bottom-0 z-30 mt-auto pb-[env(safe-area-inset-bottom)]"
	aria-label={ariaLabel}
>
	<div class="relative flex h-[75px] items-center justify-center">
		<div class="flex w-[244px] items-center justify-between">
			<div class="flex items-center">
				{#if left}{@render left()}{/if}
			</div>

			<div class="flex items-center">
				{#if right}{@render right()}{/if}
			</div>
		</div>

		{#if center}
			<div
				class="bg-bg-elevated shadow-raised-button absolute -top-[38px] left-1/2 flex h-[75px] w-[75px] -translate-x-1/2 items-center justify-center rounded-full"
			>
				{@render center()}
			</div>
		{/if}
	</div>
</nav>
