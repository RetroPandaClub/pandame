<script lang="ts">
	type Size = 'sm' | 'md' | 'lg' | 'xl';

	interface Props {
		size?: Size;
		ariaLabel?: string;
	}

	let { size = 'lg', ariaLabel = 'PandaMe' }: Props = $props();

	const SIZE: Record<Size, string> = {
		sm: 'h-12 w-12',
		md: 'h-20 w-20',
		lg: 'h-32 w-32',
		xl: 'h-48 w-48'
	};
</script>

<figure
	class="bg-primary-light/55 relative inline-flex items-center justify-center rounded-2xl {SIZE[
		size
	]}"
	aria-label={ariaLabel}
>
	<img src="/brand/panda.png" alt="" aria-hidden="true" class="h-full w-full object-contain p-2" />
</figure>
