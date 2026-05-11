<script lang="ts">
	import { page } from '$app/state';
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

	const FILTER_ORDER: readonly DealFilter[] = [
		'all',
		'active',
		'settled',
		'refunded',
		'cancelled'
	];

	const isDealFilter = (value: string | null): value is DealFilter =>
		value !== null && (FILTER_ORDER as readonly string[]).includes(value);

	// `?filter=` is the contract used by the home chatbot's "See your
	// deals" branch (and by any future deep-link). Anything we don't
	// recognise falls back to the safe `all` view rather than throwing.
	const initialFilter = (): DealFilter => {
		const raw = page.url.searchParams.get('filter');
		return isDealFilter(raw) ? raw : 'all';
	};

	let filter: DealFilter = $state(initialFilter());

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
		filter = FILTER_ORDER[(FILTER_ORDER.indexOf(filter) + 1) % FILTER_ORDER.length];
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
