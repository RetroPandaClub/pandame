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
		primary:
			'bg-primary-stroke text-default-inverse border-primary-stroke shadow-[0_4px_2px_#d5c4f9]',
		secondary:
			'bg-transparent text-primary-stroke border-primary-stroke shadow-[0_4px_4px_rgba(133,88,237,0.67)]'
	};
</script>

<!--
  Reply pills mirroring the bot bubble's "blob" shape — tl-50 / br-50
  / tr-22 / bl-22 — with a 1 px purple-stroke border and the Figma
  drop-shadow (lavender on filled, translucent purple on outlined).
  Typography is Poppins Medium 12 px. `primary` = filled purple,
  `secondary` = transparent outline. `pl-[88px]` indents the row
  under the 70 px bot avatar + 18 px gap.
-->
<div class="flex flex-wrap items-center gap-[16px] pl-[88px]" role="group" aria-label={ariaLabel}>
	{#each choices as choice (choice.id)}
		<button
			type="button"
			disabled={choice.disabled}
			onclick={choice.onclick}
			class="flex h-[38px] items-center justify-center rounded-tl-[50px] rounded-tr-[22px] rounded-br-[50px] rounded-bl-[22px] border px-[20px] font-sans text-[12px] font-medium transition-colors {VARIANT[
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
