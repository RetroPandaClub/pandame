<script lang="ts">
	type Size = 'sm' | 'md' | 'lg' | 'xl';

	interface Props {
		src?: string;
		alt?: string;
		fallback?: string;
		size?: Size;
		ariaLabel?: string;
	}

	let { src, alt = '', fallback = '', size = 'md', ariaLabel }: Props = $props();

	// Each named size matches a real avatar archetype:
	//   sm: 32 px — status dot / inline thumbnail
	//   md: 48 px — BrandHeader trailing
	//   lg: 76 px — bot avatar inside a chat bubble
	//   xl: 122 px — big profile avatar overlapping the header seam
	const SIZE: Record<Size, string> = {
		sm: 'h-8 w-8 text-body2',
		md: 'h-12 w-12 text-body1',
		lg: 'h-[76px] w-[76px] text-h6',
		xl: 'h-[122px] w-[122px] text-h4'
	};

	let initials = $derived(
		fallback
			.trim()
			.split(/\s+/)
			.map((part) => part.charAt(0).toUpperCase())
			.slice(0, 2)
			.join('')
	);
</script>

<span
	class="border-border-soft bg-primary-light text-primary inline-flex items-center justify-center overflow-hidden rounded-full border font-bold {SIZE[
		size
	]}"
	aria-label={ariaLabel ?? alt ?? fallback}
>
	{#if src}
		<img {src} {alt} class="h-full w-full object-cover" />
	{:else}
		<span aria-hidden="true">{initials || '·'}</span>
	{/if}
</span>
