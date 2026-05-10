<script lang="ts">
	interface Props {
		ariaLabel?: string;
	}

	let { ariaLabel }: Props = $props();
</script>

<!--
  Bottom-nav transactions glyph — two horizontal arrows pointing in
  opposite directions. Strokes with `currentColor`.
-->
<svg
	viewBox="0 0 26 26"
	fill="none"
	stroke="currentColor"
	stroke-width="2.6"
	stroke-linecap="round"
	stroke-linejoin="round"
	role="img"
	aria-label={ariaLabel}
	aria-hidden={ariaLabel === undefined ? true : undefined}
>
	<path d="M3 8H21L15.9709 3" />
	<path d="M21 16H3L8.02911 21" />
</svg>
