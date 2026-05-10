<script lang="ts">
	type Size = 'sm' | 'md' | 'lg';

	interface Props {
		size?: Size;
		ariaLabel?: string;
	}

	let { size = 'md', ariaLabel = 'PandaMe' }: Props = $props();

	const SIZE: Record<Size, string> = {
		sm: 'h-[40px] w-[40px]',
		md: 'h-[70px] w-[70px]',
		lg: 'h-[76px] w-[76px]'
	};
</script>

<!--
  Disc fill `#e0e2ff` is intentional — slightly bluer than
  `--color-primary-light` so the disc reads as a halo against the
  purple header rather than melting into it.
-->
<figure
	class="relative inline-flex shrink-0 items-center justify-center rounded-full bg-[#e0e2ff] {SIZE[
		size
	]}"
	aria-label={ariaLabel}
>
	<img src="/brand/panda.png" alt="" aria-hidden="true" class="h-full w-full object-contain p-2" />
</figure>
