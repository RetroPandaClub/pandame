<script lang="ts">
	type Size = 'sm' | 'md' | 'lg' | 'xl';

	interface Props {
		size?: Size;
		ariaLabel?: string;
	}

	let { size = 'lg', ariaLabel = 'PandaMe' }: Props = $props();

	const SIZE: Record<Size, string> = {
		sm: 'h-24 w-24 text-h2',
		md: 'h-40 w-40 text-h1',
		lg: 'h-56 w-56 text-[6rem]',
		xl: 'h-72 w-72 text-[8rem]'
	};
</script>

<!--
  Brand illustration: a dotted purple ring around the PandaMe mark.

  The ring is rendered as an SVG `<circle>` with `stroke-dasharray` for the
  dotted look + a per-1° rotation hint via `<animateTransform>`-free CSS so
  the vector stays accessible. The mark itself is an emoji placeholder; swap
  for a vector asset by replacing the inner span.
-->
<figure
	class="relative inline-flex items-center justify-center {SIZE[size]}"
	aria-label={ariaLabel}
>
	<svg
		viewBox="0 0 100 100"
		class="text-primary/40 absolute inset-0 h-full w-full"
		aria-hidden="true"
		fill="none"
	>
		<circle
			cx="50"
			cy="50"
			r="48"
			stroke="currentColor"
			stroke-width="0.6"
			stroke-dasharray="0.6 3"
			stroke-linecap="round"
		/>
		<circle
			cx="50"
			cy="50"
			r="42"
			stroke="currentColor"
			stroke-width="0.4"
			stroke-dasharray="0.4 4"
			stroke-linecap="round"
			opacity="0.6"
		/>
	</svg>

	<span aria-hidden="true" class="leading-none select-none">🐼</span>
</figure>
