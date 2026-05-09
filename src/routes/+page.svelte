<script lang="ts">
	import { goto } from '$app/navigation';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import BalanceBadge from '$lib/components/BalanceBadge.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import Button from '$lib/components/Button.svelte';
	import DealFilterChips, { type DealFilter } from '$lib/components/DealFilterChips.svelte';
	import DealsTable from '$lib/components/DealsTable.svelte';
	import WelcomeScreen from '$lib/components/WelcomeScreen.svelte';
	import { userSignedIn } from '$lib/derived/user.derived';
	import { myBalance } from '$lib/services/balance.services';
	import { listMyDeals } from '$lib/services/deal.services';
	import { balanceStore } from '$lib/stores/balance.store';
	import { dealsStore } from '$lib/stores/deals.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { userStore } from '$lib/stores/user.store';
	import { shortPrincipal } from '$lib/utils/format.utils';

	let filter: DealFilter = $state('all');

	const reloadDeals = async () => {
		if (!$userSignedIn) {
			dealsStore.reset();
			balanceStore.set(undefined);

			return;
		}

		try {
			const [deals, balance] = await Promise.all([listMyDeals(), myBalance()]);
			dealsStore.set(deals);
			balanceStore.set(balance);
		} catch (err) {
			console.error('Failed to refresh dashboard:', err);
		}
	};

	$effect(() => {
		reloadDeals();
	});

	let principalLabel = $derived(
		$userStore?.key !== undefined ? shortPrincipal($userStore.key) : ''
	);
</script>

<svelte:window onjunoExampleReload={reloadDeals} />

{#if !$userSignedIn}
	<WelcomeScreen />
{:else}
	<BrandHeader title={$i18n.history.title}>
		{#snippet trailing()}
			<span class="text-default-inverse text-body2 font-bold underline-offset-2 hover:underline">
				{principalLabel}
			</span>
			<Avatar fallback={principalLabel} size="md" alt={principalLabel} />
		{/snippet}

		<DealFilterChips bind:value={filter} />
	</BrandHeader>

	<section class="flex flex-1 flex-col gap-4 px-6 pt-6 pb-28">
		<div class="flex items-center justify-between">
			<BalanceBadge />
			<Button size="sm" onclick={() => goto('/deals/new')}>
				{$i18n.deals.create_cta}
			</Button>
		</div>

		<DealsTable {filter} />
	</section>

	<AppBottomNav />
{/if}
