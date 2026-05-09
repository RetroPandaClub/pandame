<script lang="ts">
	type Size = 'sm' | 'md' | 'lg';

	interface Props {
		size?: Size;
		ariaLabel?: string;
	}

	let { size = 'md', ariaLabel = 'PandaMe' }: Props = $props();

	const SIZE: Record<Size, string> = {
		sm: 'h-[40px] w-[40px]',
		md: 'h-[60px] w-[60px]',
		lg: 'h-[76px] w-[76px]'
	};
</script>

<!--
  Figma chat-bubble bot avatar (lavender disc with the panda
  silhouette inside, ~76 px on the home chat). Same artwork as
  `PandaMark` / favicon — different chrome (full circle here vs
  squircle on PandaMark).
-->
<figure
	class="bg-primary-light/55 relative inline-flex shrink-0 items-center justify-center rounded-full {SIZE[
		size
	]}"
	aria-label={ariaLabel}
>
	<img src="/brand/panda.png" alt="" aria-hidden="true" class="h-full w-full object-contain p-2" />
</figure>
