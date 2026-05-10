<script lang="ts">
	interface Props {
		ariaLabel?: string;
	}

	let { ariaLabel }: Props = $props();
</script>

<!--
  Bottom-nav home glyph — line-only, single closed path. Strokes
  with `currentColor` so the parent button drives the colour.
-->
<svg
	viewBox="0 0 22.4 22.4"
	fill="none"
	stroke="currentColor"
	stroke-width="2.4"
	stroke-linecap="round"
	stroke-linejoin="round"
	role="img"
	aria-label={ariaLabel}
	aria-hidden={ariaLabel === undefined ? true : undefined}
>
	<path d="M14.1999 14.7657V11.9831H7.91327V21.2H1.2V9.62105L11.2 1.2L21.2 9.62105V21.2H14.1999" />
</svg>
