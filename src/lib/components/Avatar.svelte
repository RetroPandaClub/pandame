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

	const SIZE: Record<Size, string> = {
		sm: 'h-8 w-8 text-body2',
		md: 'h-11 w-11 text-body1',
		lg: 'h-14 w-14 text-h6',
		xl: 'h-20 w-20 text-h5'
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
