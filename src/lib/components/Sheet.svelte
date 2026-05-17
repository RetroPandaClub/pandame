<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		/** Negative top margin so the sheet slides *under* a coloured BrandHeader. */
		overlap?: number;
		/** Default leaves room for the BottomNav; override per route. */
		paddingClass?: string;
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
