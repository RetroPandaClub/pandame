<script lang="ts">
	import { fromNullable } from '@dfinity/utils';
	import { Principal } from '@icp-sdk/core/principal';
	import DealActions from '$lib/components/DealActions.svelte';
	import DealStatusBadge from '$lib/components/DealStatusBadge.svelte';
	import { ICP_TOKEN } from '$lib/constants/tokens.constants';
	import { i18n } from '$lib/stores/i18n.store';
	import { userStore } from '$lib/stores/user.store';
	import type { Deal, DealSide } from '$lib/types/deal';
	import { dealStatus, sideOf } from '$lib/utils/deal.utils';
	import { formatTokenAmount, nsToDate, shortPrincipal } from '$lib/utils/format.utils';

	interface Props {
		deal: Deal;
	}

	let { deal }: Props = $props();

	let principal = $derived(parsePrincipal($userStore?.key));
	let mySide: DealSide = $derived(sideOf(deal, principal));

	let status = $derived(dealStatus(deal));
	let title = $derived(fromNullable(deal.title) ?? $i18n.deals.row.untitled);
	let note = $derived(fromNullable(deal.note));
	let payer = $derived(fromNullable(deal.payer));
	let recipient = $derived(fromNullable(deal.recipient));
	let amountStr = $derived(formatTokenAmount(deal.amount, ICP_TOKEN));
	let expiresAt = $derived(nsToDate(deal.expires_at_ns));
	let mySideLabel = $derived.by(() => {
		switch (mySide) {
			case 'payer':
				return $i18n.deals.role.payer;
			case 'recipient':
				return $i18n.deals.role.recipient;
			default:
				return $i18n.deals.role.unknown;
		}
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

<article
	class="dark:border-primary grid grid-cols-1 gap-3 rounded border-[3px] border-black bg-white p-4 shadow-[5px_5px_0px_rgba(0,0,0,1)] md:grid-cols-[1fr_auto] dark:bg-black dark:text-white dark:shadow-[5px_5px_0px_#632AE8]"
	data-tid="deal-row"
>
	<div class="space-y-2">
		<header class="flex flex-wrap items-center gap-2">
			<DealStatusBadge {status} />
			<h3 class="text-base font-semibold">{title}</h3>
			<span class="text-xs opacity-60">#{deal.id.toString()}</span>
		</header>

		{#if note !== undefined}
			<p class="text-sm opacity-80">{note}</p>
		{/if}

		<dl class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
			<dt class="opacity-60">{$i18n.deals.row.amount}</dt>
			<dd class="text-right font-mono">{amountStr}</dd>

			<dt class="opacity-60">{$i18n.deals.row.payer}</dt>
			<dd class="text-right font-mono">
				{payer ? shortPrincipal(payer) : $i18n.deals.row.none}
			</dd>

			<dt class="opacity-60">{$i18n.deals.row.recipient}</dt>
			<dd class="text-right font-mono">
				{recipient ? shortPrincipal(recipient) : $i18n.deals.row.recipient_open}
			</dd>

			<dt class="opacity-60">{$i18n.deals.row.expires}</dt>
			<dd class="text-right">
				<time datetime={expiresAt.toISOString()}>{expiresAt.toLocaleString()}</time>
			</dd>

			<dt class="opacity-60">{$i18n.deals.row.your_role}</dt>
			<dd class="text-right capitalize">{mySideLabel}</dd>
		</dl>
	</div>

	<div class="flex flex-col items-stretch justify-between gap-2 md:items-end">
		<DealActions {deal} />
	</div>
</article>
