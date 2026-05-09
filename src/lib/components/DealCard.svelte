<script lang="ts">
	import { fromNullable } from '@dfinity/utils';
	import { Principal } from '@icp-sdk/core/principal';
	import Countdown from '$lib/components/Countdown.svelte';
	import DealStatusDot from '$lib/components/DealStatusDot.svelte';
	import Money from '$lib/components/Money.svelte';
	import { ICP_TOKEN } from '$lib/constants/tokens.constants';
	import { i18n } from '$lib/stores/i18n.store';
	import { userStore } from '$lib/stores/user.store';
	import type { Deal } from '$lib/types/deal';
	import { dealStatus, sideOf } from '$lib/utils/deal.utils';

	interface Props {
		deal: Deal;
		href?: string;
	}

	let { deal, href }: Props = $props();

	let principal = $derived(parsePrincipal($userStore?.key));
	let mySide = $derived(sideOf(deal, principal));
	let status = $derived(dealStatus(deal));

	let title = $derived(fromNullable(deal.title) ?? `Deal ${deal.id.toString()}`);

	// Render amount as signed from the caller's PoV: positive when funds are
	// flowing toward the caller (recipient), negative when leaving (payer).
	let signedAmount = $derived.by(() => {
		if (mySide === 'recipient') {
			return deal.amount;
		}

		if (mySide === 'payer') {
			return -deal.amount;
		}

		return deal.amount;
	});

	function parsePrincipal(text: string | undefined): Principal | undefined {
		if (text === undefined || text.length === 0) {
			return undefined;
		}

		try {
			return Principal.fromText(text);
		} catch {
			return undefined;
		}
	}
</script>

{#snippet body()}
	<header class="bg-primary text-default-inverse flex items-center justify-between px-4 py-2">
		<span class="text-body1 font-bold">{title}</span>
		<DealStatusDot {status} />
	</header>

	<div class="flex items-center justify-between px-4 py-2">
		<span class="text-body1 text-default font-semibold">{ICP_TOKEN.name}</span>
		<Money amount={signedAmount} colorize signed />
	</div>

	<div class="border-border-soft flex items-center justify-between border-t px-4 py-2">
		<span class="text-body2 text-muted">{$i18n.deals.row.expires}</span>
		<Countdown expiresAtNs={deal.expires_at_ns} />
	</div>
{/snippet}

{#if href !== undefined}
	<a
		{href}
		data-tid="deal-card"
		class="border-border-soft bg-bg-elevated shadow-primary/5 hover:shadow-primary/10 block overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md"
	>
		{@render body()}
	</a>
{:else}
	<article
		data-tid="deal-card"
		class="border-border-soft bg-bg-elevated shadow-primary/5 overflow-hidden rounded-xl border shadow-sm"
	>
		{@render body()}
	</article>
{/if}
