<script lang="ts" generics="T extends string">
	interface Tab {
		id: T;
		label: string;
		disabled?: boolean;
	}

	interface Props {
		tabs: readonly Tab[];
		value: T;
		onchange?: (next: T) => void;
		ariaLabel?: string;
	}

	let { tabs, value = $bindable(), onchange = () => {}, ariaLabel = 'Tabs' }: Props = $props();

	const select = (id: T) => () => {
		value = id;
		onchange(id);
	};
</script>

<!--
  Segmented control sized to sit on the purple BrandHeader:
    - Container: `rounded-xl` (20 px) with a translucent-white
      0.846 px border, transparent fill.
    - Each tab: ~121 × 34 px, `rounded-tab` (23 px).
    - Active:   off-white canvas fill, Blu Night text.
    - Inactive: transparent, white text @ 90 %.
  Typography is Inter Medium 11.85 px tracking `-0.237 px` per the
  brand spec for compact controls.
-->
<div
	role="tablist"
	aria-label={ariaLabel}
	class="inline-flex items-center rounded-xl border-[0.846px] border-white/15 bg-transparent"
>
	{#each tabs as tab (tab.id)}
		{@const active = value === tab.id}
		<button
			type="button"
			role="tab"
			aria-selected={active}
			disabled={tab.disabled}
			onclick={select(tab.id)}
			class="rounded-tab font-serif-ui flex h-[34px] min-w-[120px] items-center justify-center px-[20px] text-[11.85px] font-medium tracking-[-0.237px] transition-colors {active
				? 'bg-bg text-default'
				: 'text-default-inverse/90 hover:text-default-inverse'} {tab.disabled
				? 'cursor-not-allowed opacity-40'
				: ''}"
		>
			{tab.label}
		</button>
	{/each}
</div>
