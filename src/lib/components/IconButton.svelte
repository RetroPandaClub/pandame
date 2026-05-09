<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'floating';
	type Size = 'sm' | 'md' | 'lg';

	interface Props {
		children: Snippet;
		onclick?: () => void | Promise<void>;
		ariaLabel: string;
		disabled?: boolean;
		variant?: Variant;
		size?: Size;
		shape?: 'square' | 'circle';
		type?: 'button' | 'submit' | 'reset';
	}

	let {
		children,
		onclick,
		ariaLabel,
		disabled = false,
		variant = 'ghost',
		size = 'md',
		shape = 'circle',
		type = 'button'
	}: Props = $props();

	const VARIANT: Record<Variant, string> = {
		primary: 'bg-primary text-white hover:bg-primary/90 active:bg-primary/80',
		secondary:
			'bg-transparent border-2 border-primary text-primary hover:bg-primary/10 active:bg-primary/20',
		ghost: 'bg-transparent text-default hover:bg-primary/10 active:bg-primary/20',
		floating: 'bg-bg text-default border border-border-soft shadow-lg shadow-primary/15'
	};

	const SIZE: Record<Size, string> = {
		sm: 'h-8 w-8 [&>svg]:h-4 [&>svg]:w-4',
		md: 'h-11 w-11 [&>svg]:h-5 [&>svg]:w-5',
		lg: 'h-16 w-16 [&>svg]:h-7 [&>svg]:w-7'
	};

	const SHAPE = {
		square: 'rounded-md',
		circle: 'rounded-full'
	};
</script>

<button
	{type}
	{onclick}
	{disabled}
	aria-label={ariaLabel}
	class="inline-flex items-center justify-center transition-colors {VARIANT[variant]} {SIZE[
		size
	]} {SHAPE[shape]} {disabled ? 'cursor-not-allowed opacity-40' : ''}"
>
	{@render children()}
</button>
