<script lang="ts">
	import { fromNullable } from '@dfinity/utils';
	import { Principal } from '@icp-sdk/core/principal';
	import type { Snippet } from 'svelte';
	import Countdown from '$lib/components/Countdown.svelte';
	import DealStatusIcon from '$lib/components/DealStatusIcon.svelte';
	import Money from '$lib/components/Money.svelte';
	import { ICP_TOKEN } from '$lib/constants/tokens.constants';
	import { i18n } from '$lib/stores/i18n.store';
	import { userStore } from '$lib/stores/user.store';
	import type { Deal } from '$lib/types/deal';
	import { dealStatus, sideOf } from '$lib/utils/deal.utils';

	interface Props {
		deal: Deal;
		href?: string;
		/** Optional bottom-of-card snippet (e.g. Approve / Decline). */
		actions?: Snippet;
		/** Show the dispute panel size — the consenting party should see it before tapping Approve. */
		showPanelSize?: boolean;
	}

	let { deal, href, actions, showPanelSize = false }: Props = $props();

	let panelSize = $derived(fromNullable(deal.panel_size));

	let principal = $derived(parsePrincipal($userStore?.key));
	let mySide = $derived(sideOf(deal, principal));
	let status = $derived(dealStatus(deal));

	let title = $derived(fromNullable(deal.title) ?? `Deal ${deal.id.toString()}`);

	// Sign from the caller's PoV: + when funds flow in, − when out.
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

<!-- Title bar is inset so it reads as a label inside the card, not an edge-to-edge banner. -->
{#snippet body()}
	<header
		class="bg-primary-stroke text-default-inverse mx-[11px] mt-[11px] flex h-[24px] items-center justify-between rounded-[4px] px-[10px]"
	>
		<span class="font-sans text-[12px] leading-none font-semibold tracking-[0.48px]">{title}</span>
		<DealStatusIcon {status} />
	</header>

	<div class="flex items-baseline justify-between px-[18px] pt-[14px]">
		<span class="text-default font-sans text-[16px] font-medium">{ICP_TOKEN.name}</span>
		<Money amount={signedAmount} colorize signed size="md" />
	</div>

	<div class="flex items-center justify-between px-[18px] pt-[4px] pb-[14px]">
		<span class="text-default font-sans text-[14px] font-normal">
			{$i18n.deals.row.expires}
		</span>
		<Countdown expiresAtNs={deal.expires_at_ns} />
	</div>

	{#if showPanelSize}
		<div class="flex items-center justify-between px-[18px] pb-[12px]">
			<span class="text-muted font-sans text-[12px] font-normal">
				{$i18n.deals.row.panel_size}
			</span>
			<span class="text-default font-sans text-[12px] font-medium tabular-nums">
				{#if panelSize !== undefined}
					{$i18n.deals.row.panel_size_value.replace('{n}', String(panelSize))}
				{:else}
					{$i18n.deals.row.panel_size_default}
				{/if}
			</span>
		</div>
	{/if}

	{#if actions}
		<div class="flex items-center gap-[16px] px-[18px] pb-[12px]">
			{@render actions()}
		</div>
	{/if}
{/snippet}

{#if href !== undefined}
	<a
		{href}
		data-tid="deal-card"
		class="bg-bg-elevated shadow-deal-card block overflow-hidden rounded-[10px] transition-shadow hover:shadow-md"
	>
		{@render body()}
	</a>
{:else}
	<article
		data-tid="deal-card"
		class="bg-bg-elevated shadow-deal-card overflow-hidden rounded-[10px]"
	>
		{@render body()}
	</article>
{/if}
