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
  Figma BottomNav (`105:184` instance):
    - 375 × 75 white card, rounded-tl/tr-[14px]
    - Shadow: 0 0 80px 0 rgba(55,62,125,0.25) — `shadow-bottom-nav`
    - px-[74px] py-[23px], left + right icons spaced gap-[160px]
    - Raised circular Home button (75 × 75) breaking out the top by
      ~28 px, double drop-shadow (`shadow-raised-button`)
-->
<nav
	class="bg-bg-elevated rounded-t-bottom-nav shadow-bottom-nav sticky bottom-0 z-30 mt-auto pb-[env(safe-area-inset-bottom)]"
	aria-label={ariaLabel}
>
	<div class="relative flex h-[75px] items-center justify-between px-[40px]">
		<div class="flex items-center">
			{#if left}{@render left()}{/if}
		</div>

		<div class="flex items-center">
			{#if right}{@render right()}{/if}
		</div>

		{#if center}
			<div
				class="bg-bg-elevated shadow-raised-button absolute -top-[28px] left-1/2 flex h-[75px] w-[75px] -translate-x-1/2 items-center justify-center rounded-full"
			>
				{@render center()}
			</div>
		{/if}
	</div>
</nav>
