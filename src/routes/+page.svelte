<script lang="ts">
	import BalanceBadge from '$lib/components/BalanceBadge.svelte';
	import Button from '$lib/components/Button.svelte';
	import CreateDealModal from '$lib/components/CreateDealModal.svelte';
	import DealsTable from '$lib/components/DealsTable.svelte';
	import Login from '$lib/components/Login.svelte';
	import Logout from '$lib/components/Logout.svelte';
	import ShareLinkModal from '$lib/components/ShareLinkModal.svelte';
	import { userSignedIn } from '$lib/derived/user.derived';
	import { myBalance } from '$lib/services/balance.services';
	import { listMyDeals } from '$lib/services/deal.services';
	import { balanceStore } from '$lib/stores/balance.store';
	import { dealsStore } from '$lib/stores/deals.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Deal } from '$lib/types/deal';

	let createOpen = $state(false);
	let shareDeal: Deal | undefined = $state(undefined);

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

	const onCreated = (deal: Deal) => {
		dealsStore.upsert(deal);
		balanceStore.set(undefined);
		reloadDeals();
		shareDeal = deal;
	};
</script>

<svelte:window onjunoExampleReload={reloadDeals} />

{#if !$userSignedIn}
	<section
		class="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-6 py-10 text-center"
	>
		<h1 class="text-h4 text-default font-bold">
			{$i18n.layout.title}
		</h1>
		<p class="text-muted">{$i18n.claim.signin_description}</p>
		<Login />
	</section>
{:else}
	<section class="flex flex-1 flex-col gap-6 px-6 pt-[max(env(safe-area-inset-top),1.5rem)] pb-10">
		<header class="flex items-center justify-between">
			<h1 class="text-h5 text-default font-bold">{$i18n.layout.title}</h1>
			<BalanceBadge />
		</header>

		<Button
			onclick={() => {
				createOpen = true;
			}}
		>
			{$i18n.deals.create_cta}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="20"
				viewBox="0 -960 960 960"
				width="20"
				fill="currentColor"
				aria-hidden="true"
			>
				<path d="M417-417H166v-126h251v-251h126v251h251v126H543v251H417v-251Z" />
			</svg>
		</Button>

		<DealsTable />

		<div class="mt-auto pt-6">
			<Logout />
		</div>
	</section>
{/if}

<CreateDealModal open={createOpen} onclose={() => (createOpen = false)} oncreated={onCreated} />

{#if shareDeal !== undefined}
	<ShareLinkModal
		open
		dealId={shareDeal.id}
		claimCode={shareDeal.claim_code}
		onclose={() => (shareDeal = undefined)}
	/>
{/if}
