<script lang="ts">
	interface Props {
		ariaLabel?: string;
	}

	let { ariaLabel }: Props = $props();
</script>

<svg
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	role="img"
	aria-label={ariaLabel}
	aria-hidden={ariaLabel === undefined ? true : undefined}
>
	<circle cx="12" cy="8" r="4" />
	<path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
</svg>
