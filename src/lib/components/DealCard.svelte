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

	// Sign as in Figma: positive when funds flow TO the caller (recipient),
	// negative when leaving (payer).
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
  Figma deal card (`244:1111` "Deal Concluded Correctly" + `228:1437`
  "Pending"):
    - Outer: bg-bg-elevated, rounded-[12px], shadow-deal-card, border 0.
    - Title bar: bg-primary px-4 py-1.5, deal title white Poppins
      Bold ~14 px on the left, DealStatusIcon (24 px circle) on the
      right. Bar has its own rounded-t-[8px] (slightly tighter than
      the card so it reads as a label inside).
    - Body row 1: currency name (Poppins Bold ~18 px Blu Night) on
      the left, signed amount (Money, colorized) on the right.
    - Body row 2: "Time to conclude" (Poppins Regular ~14 px Blu
      Night/.7) on the left, Countdown on the right.
    - Optional `actions` slot at the bottom for the inline Approve /
      Decline / Choose-files-to-upload row.
-->
{#snippet body()}
	<header
		class="bg-primary text-default-inverse mx-[8px] mt-[8px] flex items-center justify-between rounded-[8px] px-[14px] py-[6px]"
	>
		<span class="font-sans text-[14px] leading-tight font-bold">{title}</span>
		<DealStatusIcon {status} />
	</header>

	<div class="flex items-baseline justify-between px-[18px] pt-[12px]">
		<span class="text-default font-sans text-[18px] font-bold">{ICP_TOKEN.name}</span>
		<Money amount={signedAmount} colorize signed size="md" />
	</div>

	<div class="flex items-center justify-between px-[18px] pt-[6px] pb-[14px]">
		<span class="text-default text-figma-14 font-sans opacity-70">
			{$i18n.deals.row.expires}
		</span>
		<Countdown expiresAtNs={deal.expires_at_ns} />
	</div>

	{#if actions}
		<div class="border-border-soft flex items-center gap-[8px] border-t px-[14px] py-[10px]">
			{@render actions()}
		</div>
	{/if}
{/snippet}

{#if href !== undefined}
	<a
		{href}
		data-tid="deal-card"
		class="bg-bg-elevated shadow-deal-card block overflow-hidden rounded-[12px] transition-shadow hover:shadow-md"
	>
		{@render body()}
	</a>
{:else}
	<article
		data-tid="deal-card"
		class="bg-bg-elevated shadow-deal-card overflow-hidden rounded-[12px]"
	>
		{@render body()}
	</article>
{/if}
