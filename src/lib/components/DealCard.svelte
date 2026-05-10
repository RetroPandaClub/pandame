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
		/**
		 * Optional snippet rendered at the bottom of the card body
		 * (e.g. the Approve / Decline pair on Pending, or the Choose-files
		 * button on Created).
		 */
		actions?: Snippet;
	}

	let { deal, href, actions }: Props = $props();

	let principal = $derived(parsePrincipal($userStore?.key));
	let mySide = $derived(sideOf(deal, principal));
	let status = $derived(dealStatus(deal));

	let title = $derived(fromNullable(deal.title) ?? `Deal ${deal.id.toString()}`);

	// Sign from the caller's PoV: positive when funds flow TO them
	// (recipient), negative when leaving (payer).
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

<!--
  Single-deal preview card:
    - Outer: `bg-bg-elevated`, `rounded-[10px]`, `shadow-deal-card`,
      no border.
    - Title bar: an INSET `primary-stroke` (#632AE8) pill (mx/mt 11
      px, `rounded-[4px]`, `h-[24px]`) with the deal title (Poppins
      SemiBold 12 px white tracking 0.48 px, centred) on the left
      and `<DealStatusIcon>` (24 px circle) on the right. Inset
      rather than edge-to-edge so it reads as a label inside the
      card.
    - Body row 1: currency name (Poppins Medium 16 px Blu Night) +
      signed amount (`<Money>`, colorize + signed).
    - Body row 2: "Time to conclude" (Poppins Regular 14 px) +
      `<Countdown>` with a small letter-spacing nudge.
    - Optional `actions` snippet at the bottom for inline Approve /
      Decline / Choose-files rows on Pending / Created lists.
-->
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
