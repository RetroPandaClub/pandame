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

<div
	role="tablist"
	aria-label={ariaLabel}
	class="rounded-pill bg-primary/30 inline-flex items-center p-1"
>
	{#each tabs as tab (tab.id)}
		{@const active = value === tab.id}
		<button
			type="button"
			role="tab"
			aria-selected={active}
			disabled={tab.disabled}
			onclick={select(tab.id)}
			class="rounded-pill text-body2 px-6 py-2 font-bold transition-colors {active
				? 'bg-bg text-primary shadow-sm'
				: 'text-default-inverse/90 hover:text-default-inverse'} {tab.disabled
				? 'cursor-not-allowed opacity-40'
				: ''}"
		>
			{tab.label}
		</button>
	{/each}
</div>
