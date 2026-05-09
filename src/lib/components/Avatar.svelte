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

	// Sizes mirror the Figma usage: 32 (status dot), 48 (BrandHeader
	// trailing — matches `159:1128 / 166:403`), 76 (bot avatar in
	// chat bubbles), 134 (big profile avatar overlapping the
	// purple→white seam — `83:84 / 71:302`).
	const SIZE: Record<Size, string> = {
		sm: 'h-8 w-8 text-body2',
		md: 'h-12 w-12 text-body1',
		lg: 'h-[76px] w-[76px] text-h6',
		xl: 'h-[134px] w-[134px] text-h4'
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
