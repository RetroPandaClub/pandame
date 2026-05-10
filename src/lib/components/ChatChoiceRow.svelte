<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary';

	interface Choice {
		id: string;
		label: string;
		variant?: Variant;
		disabled?: boolean;
		onclick?: () => void | Promise<void>;
	}

	interface Props {
		choices: readonly Choice[];
		ariaLabel?: string;
		/** Optional snippet for an extra free-form CTA after the choices. */
		extra?: Snippet;
	}

	let { choices, ariaLabel = 'Reply choices', extra }: Props = $props();

	const VARIANT: Record<Variant, string> = {
		primary: 'bg-primary-stroke text-default-inverse border-primary-stroke',
		secondary: 'bg-bg-elevated text-primary-stroke border-primary-stroke'
	};
</script>

<!--
  2–3 outlined / filled reply pills aligned under the previous bot
  bubble. Each pill: `rounded-button` (22 px), 1.5 px purple-stroke
  border, Poppins SemiBold 14 px, 40 × variable. `primary` = filled
  purple, `secondary` = white outline. `pl-[72px]` indents the row
  under the 60 px bot avatar + 12 px gap.
-->
<div class="flex flex-wrap items-center gap-[16px] pl-[72px]" role="group" aria-label={ariaLabel}>
	{#each choices as choice (choice.id)}
		<button
			type="button"
			disabled={choice.disabled}
			onclick={choice.onclick}
			class="rounded-button flex h-[40px] items-center justify-center border-[1.5px] px-[20px] font-sans text-[14px] font-semibold transition-colors {VARIANT[
				choice.variant ?? 'secondary'
			]} {choice.disabled ? 'cursor-not-allowed opacity-40' : 'hover:opacity-90 active:opacity-80'}"
		>
			{choice.label}
		</button>
	{/each}

	{#if extra}
		{@render extra()}
	{/if}
</div>
