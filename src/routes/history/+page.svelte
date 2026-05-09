<script lang="ts">
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import DealsTable from '$lib/components/DealsTable.svelte';
	import FilterChip from '$lib/components/FilterChip.svelte';
	import Sheet from '$lib/components/Sheet.svelte';
	import UserPrincipalBadge from '$lib/components/UserPrincipalBadge.svelte';
	import { listMyDeals } from '$lib/services/deal.services';
	import { dealsStore } from '$lib/stores/deals.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { DealFilter } from '$lib/types/deal';

	let filter: DealFilter = $state('all');

	const FILTER_LABELS: Record<DealFilter, string> = {
		all: $i18n.history.filter_all,
		active: $i18n.history.filter_active,
		settled: $i18n.history.filter_settled,
		refunded: $i18n.history.filter_refunded,
		cancelled: $i18n.history.filter_cancelled
	};

	let filterLabel = $derived(`${FILTER_LABELS[filter]} Filter`);

	const reload = async () => {
		try {
			const deals = await listMyDeals();
			dealsStore.set(deals);
		} catch (err) {
			console.error('Failed to refresh history:', err);
		}
	};

	const cycleFilter = () => {
		const order: DealFilter[] = ['all', 'active', 'settled', 'refunded', 'cancelled'];
		filter = order[(order.indexOf(filter) + 1) % order.length];
	};

	$effect(() => {
		reload();
	});
</script>

<svelte:head>
	<title>{$i18n.history.title} · {$i18n.layout.title}</title>
</svelte:head>

<svelte:window onjunoExampleReload={reload} />

<AuthGuard />

<BrandHeader title={$i18n.history.title}>
	{#snippet trailing()}
		<UserPrincipalBadge />
	{/snippet}

	<FilterChip
		label={filterLabel}
		ariaLabel="Cycle history filter"
		ariaExpanded={false}
		onclick={cycleFilter}
	/>
</BrandHeader>

<Sheet paddingClass="px-[19px] pt-[26px] pb-[120px]" class="gap-[16px]">
	<DealsTable {filter} />
</Sheet>

<AppBottomNav />
