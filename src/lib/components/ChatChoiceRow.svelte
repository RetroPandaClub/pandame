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
		/**
		 * Wrap pills onto multiple rows instead of keeping them on a
		 * single line. Used when the row carries more than two choices
		 * (e.g. the See-Deal filter set in the home chatbot, Figma
		 * frame 219:306, which lays four pills out 2 × 2). Pills keep
		 * their natural width — they never truncate.
		 */
		wrap?: boolean;
	}

	let { choices, ariaLabel = 'Reply choices', extra, wrap = false }: Props = $props();

	const VARIANT: Record<Variant, string> = {
		primary: 'bg-primary-stroke text-default-inverse border-primary-stroke shadow-pill-primary',
		secondary: 'bg-transparent text-primary-stroke border-primary-stroke shadow-pill-stroke'
	};
</script>

<!--
  `pl-[88px]` indents the row under the 70 px bot avatar + 18 px
  gap. In the default (single-line) layout, `flex-nowrap` + `min-w-0
  shrink` on each pill keeps the pair on one line even on a 375 px
  frame; labels truncate before they wrap to a second row. In the
  `wrap` layout (Figma 219:306) pills keep their natural width and
  flow onto the next line when they don't fit — `gap-y-[12px]` keeps
  the rows from touching.
-->
<div
	class="flex items-center gap-x-[9px] pr-[12px] pl-[88px] {wrap
		? 'flex-wrap items-start gap-y-[12px]'
		: 'flex-nowrap'}"
	role="group"
	aria-label={ariaLabel}
>
	{#each choices as choice (choice.id)}
		<button
			type="button"
			disabled={choice.disabled}
			onclick={choice.onclick}
			class="flex h-[38px] items-center justify-center rounded-tl-[50px] rounded-tr-[22px] rounded-br-[50px] rounded-bl-[22px] border px-[20px] font-sans text-[12px] font-medium transition-colors {wrap
				? 'shrink-0 whitespace-nowrap'
				: 'min-w-0 shrink truncate'} {VARIANT[choice.variant ?? 'secondary']} {choice.disabled
				? 'cursor-not-allowed opacity-40'
				: 'hover:opacity-90 active:opacity-80'}"
		>
			{choice.label}
		</button>
	{/each}

	{#if extra}
		{@render extra()}
	{/if}
</div>
