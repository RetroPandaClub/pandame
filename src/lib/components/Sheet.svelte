<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Render the children inside the white sheet. */
		children: Snippet;
		/**
		 * Pull the sheet up over the previous element by `overlap` px so
		 * it appears to slide *under* a coloured BrandHeader. Default
		 * `40` keeps the rounded corners visible against the header.
		 */
		overlap?: number;
		/**
		 * Inner padding token mapping (defaults to `px-[19px] pt-[34px]
		 * pb-[120px]` — the create-deal layout, which doubles as a
		 * safe baseline because the bottom padding leaves room for the
		 * BottomNav). Pass `paddingClass` to override per route.
		 */
		paddingClass?: string;
		/** Optional extra classes (gap / bg / etc.). */
		class?: string;
	}

	let {
		children,
		overlap = 40,
		paddingClass = 'px-[19px] pt-[34px] pb-[120px]',
		class: extraClass = ''
	}: Props = $props();
</script>

<section
	class="bg-bg rounded-t-sheet relative flex flex-1 flex-col {paddingClass} {extraClass}"
	style="margin-top: -{overlap}px;"
>
	{@render children()}
</section>
