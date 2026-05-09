<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'solid' | 'outline' | 'soft' | 'success' | 'warning' | 'danger';

	interface Props {
		children: Snippet;
		variant?: Variant;
		leading?: Snippet;
		trailing?: Snippet;
		ariaLabel?: string;
		onclick?: () => void | Promise<void>;
	}

	let { children, variant = 'soft', leading, trailing, ariaLabel, onclick }: Props = $props();

	const VARIANT: Record<Variant, string> = {
		solid: 'bg-primary text-white',
		outline: 'bg-transparent border border-border text-default',
		soft: 'bg-primary-light text-default',
		success: 'bg-success text-white',
		warning: 'bg-warning text-white',
		danger: 'bg-danger text-white'
	};

	let interactive = $derived(onclick !== undefined);
</script>

{#if interactive}
	<button
		type="button"
		{onclick}
		aria-label={ariaLabel}
		class="rounded-pill text-body2 inline-flex items-center gap-1.5 px-3 py-1 font-semibold transition-opacity hover:opacity-90 active:opacity-80 {VARIANT[
			variant
		]}"
	>
		{#if leading}{@render leading()}{/if}
		{@render children()}
		{#if trailing}{@render trailing()}{/if}
	</button>
{:else}
	<span
		class="rounded-pill text-body2 inline-flex items-center gap-1.5 px-3 py-1 font-semibold {VARIANT[
			variant
		]}"
		aria-label={ariaLabel}
	>
		{#if leading}{@render leading()}{/if}
		{@render children()}
		{#if trailing}{@render trailing()}{/if}
	</span>
{/if}
