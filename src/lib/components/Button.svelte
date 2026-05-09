<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'ghost';
	type Size = 'sm' | 'md' | 'lg';

	interface Props {
		children: Snippet;
		onclick?: () => void | Promise<void>;
		disabled?: boolean;
		loading?: boolean;
		variant?: Variant;
		size?: Size;
		fullWidth?: boolean;
		type?: 'button' | 'submit' | 'reset';
		ariaLabel?: string;
		leading?: Snippet;
		trailing?: Snippet;
	}

	let {
		children,
		onclick,
		disabled = false,
		loading = false,
		variant = 'primary',
		size = 'md',
		fullWidth = false,
		type = 'button',
		ariaLabel,
		leading,
		trailing
	}: Props = $props();

	const VARIANT: Record<Variant, string> = {
		primary: 'bg-primary text-default-inverse hover:bg-primary/90 active:bg-primary/80',
		secondary:
			'bg-transparent border-2 border-primary text-primary hover:bg-primary/10 active:bg-primary/20',
		ghost: 'bg-transparent text-primary hover:bg-primary/10 active:bg-primary/20'
	};

	const SIZE: Record<Size, string> = {
		sm: 'h-9 px-4 text-body2',
		md: 'h-12 px-6 text-body1',
		lg: 'h-14 px-8 text-h6'
	};

	let isDisabled = $derived(disabled || loading);
</script>

<button
	{type}
	{onclick}
	disabled={isDisabled}
	aria-label={ariaLabel}
	aria-busy={loading || undefined}
	class="rounded-pill inline-flex items-center justify-center gap-2 font-bold transition-colors {VARIANT[
		variant
	]} {SIZE[size]} {fullWidth ? 'w-full' : ''} {isDisabled ? 'cursor-not-allowed opacity-40' : ''}"
>
	{#if loading}
		<span
			class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
			aria-hidden="true"
		></span>
	{:else if leading}
		{@render leading()}
	{/if}

	{@render children()}

	{#if trailing && !loading}
		{@render trailing()}
	{/if}
</button>
