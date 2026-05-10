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
		primary: 'bg-primary-stroke text-default-inverse border-primary-stroke shadow-pill-primary',
		secondary: 'bg-transparent text-primary-stroke border-primary-stroke shadow-pill-stroke'
	};
</script>

<!--
  `pl-[88px]` indents the row under the 70 px bot avatar + 18 px
  gap. `flex-nowrap` + `min-w-0 shrink` on each pill keeps the
  pair on one line even on a 375 px frame; labels truncate before
  they wrap to a second row.
-->
<div
	class="flex flex-nowrap items-center gap-[9px] pr-[12px] pl-[88px]"
	role="group"
	aria-label={ariaLabel}
>
	{#each choices as choice (choice.id)}
		<button
			type="button"
			disabled={choice.disabled}
			onclick={choice.onclick}
			class="flex h-[38px] min-w-0 shrink items-center justify-center truncate rounded-tl-[50px] rounded-tr-[22px] rounded-br-[50px] rounded-bl-[22px] border px-[16px] font-sans text-[12px] font-medium transition-colors {VARIANT[
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
