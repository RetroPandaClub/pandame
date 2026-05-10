<script lang="ts">
	interface Props {
		ariaLabel?: string;
	}

	let { ariaLabel }: Props = $props();
</script>

<!--
  Info icon — outlined circle, vertical bar, dot. The bar uses
  `currentColor` for stroke; the dot uses `currentColor` fill.
-->
<svg
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.1875"
	role="img"
	aria-label={ariaLabel}
	aria-hidden={ariaLabel === undefined ? true : undefined}
>
	<circle cx="12" cy="12" r="10" />
	<path d="M12 17V11" stroke-linecap="round" />
	<circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
</svg>
