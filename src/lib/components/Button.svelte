<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'ghost';

	/**
	 * Sizes mirror the Figma button instances exactly:
	 *   - `xs` (31 × any, rounded-[9px])      — "Choose files to upload"
	 *   - `sm` (36 px, rounded-button)        — chat reply pills
	 *   - `md` (40 px, rounded-button)        — canonical CTA, e.g.
	 *                                          "Create new deals"
	 *   - `lg` (54 px, rounded-button)        — hero CTA, e.g.
	 *                                          "Bottone Home" / Welcome "Connect"
	 */
	type Size = 'xs' | 'sm' | 'md' | 'lg';

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
		primary:
			'bg-primary-stroke text-default-inverse hover:bg-primary-stroke/90 active:bg-primary-stroke/80',
		secondary:
			'bg-transparent border-[1.5px] border-primary-stroke text-primary-stroke hover:bg-primary-stroke/10 active:bg-primary-stroke/20',
		ghost:
			'bg-transparent text-primary-stroke hover:bg-primary-stroke/10 active:bg-primary-stroke/20'
	};

	const SIZE: Record<Size, string> = {
		xs: 'h-[31px] px-[14px] text-[11.4px] rounded-[9px]',
		sm: 'h-9 px-[18px] text-[12px] rounded-button',
		md: 'h-[40px] px-[20px] text-figma-12 rounded-button',
		lg: 'h-[54px] px-[28px] text-body1 rounded-button'
	};

	let isDisabled = $derived(disabled || loading);
</script>

<button
	{type}
	{onclick}
	disabled={isDisabled}
	aria-label={ariaLabel}
	aria-busy={loading || undefined}
	class="inline-flex items-center justify-center gap-2 font-sans font-semibold transition-colors {VARIANT[
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
