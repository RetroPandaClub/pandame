<script lang="ts">
	interface Props {
		ariaLabel?: string;
	}

	let { ariaLabel }: Props = $props();
</script>

<!--
  Bottom-nav profile glyph — head ellipse + truncated shoulders.
  Strokes with `currentColor`.
-->
<svg
	viewBox="0 0 28 28"
	fill="none"
	stroke="currentColor"
	stroke-width="2.4"
	stroke-linecap="round"
	stroke-linejoin="round"
	role="img"
	aria-label={ariaLabel}
	aria-hidden={ariaLabel === undefined ? true : undefined}
>
	<ellipse cx="13.5" cy="8" rx="4.5" ry="4" />
	<path d="M22 23V21C22 18.7909 20.2091 17 18 17H9C6.79086 17 5 18.7909 5 21V23H14.0799" />
</svg>
