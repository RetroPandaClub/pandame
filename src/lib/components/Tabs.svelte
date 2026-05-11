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
  Outer container is a full pill (Figma component `Toggle Pay Receive`
  uses `rounded-[20px]` which collapses to a capsule at the 34 px
  active-pill height we render). The thin white-15% border keeps it
  visible against the purple BrandHeader without competing with the
  active tab chip.
-->
<div
	role="tablist"
	aria-label={ariaLabel}
	class="inline-flex items-center rounded-full border border-white/15 bg-transparent"
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
