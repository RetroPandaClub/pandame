<script lang="ts">
	import Chip from '$lib/components/Chip.svelte';
	import FilterIcon from '$lib/components/icons/FilterIcon.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	export type DealFilter = 'all' | 'active' | 'settled' | 'refunded' | 'cancelled';

	interface Props {
		value: DealFilter;
		onchange?: (next: DealFilter) => void;
	}

	let { value = $bindable('all'), onchange = () => {} }: Props = $props();

	type FilterKey =
		| 'filter_all'
		| 'filter_active'
		| 'filter_settled'
		| 'filter_refunded'
		| 'filter_cancelled';

	const FILTERS: readonly { id: DealFilter; key: FilterKey }[] = [
		{ id: 'all', key: 'filter_all' },
		{ id: 'active', key: 'filter_active' },
		{ id: 'settled', key: 'filter_settled' },
		{ id: 'refunded', key: 'filter_refunded' },
		{ id: 'cancelled', key: 'filter_cancelled' }
	] as const;

	const select = (id: DealFilter) => () => {
		value = id;
		onchange(id);
	};
</script>

<div class="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1" role="group" aria-label="Filter deals">
	{#each FILTERS as filter (filter.id)}
		{@const active = value === filter.id}
		<Chip variant={active ? 'solid' : 'outline'} onclick={select(filter.id)}>
			{#snippet leading()}
				{#if active}
					<FilterIcon />
				{/if}
			{/snippet}
			{$i18n.history[filter.key]}
		</Chip>
	{/each}
</div>
