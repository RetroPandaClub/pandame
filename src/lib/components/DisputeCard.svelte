<script lang="ts">
	import Countdown from '$lib/components/Countdown.svelte';
	import DisputePhaseBadge from '$lib/components/DisputePhaseBadge.svelte';
	import Money from '$lib/components/Money.svelte';
	import { ICP_TOKEN } from '$lib/constants/tokens.constants';
	import { DisputePhases } from '$lib/enums/dispute';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Dispute } from '$lib/types/dispute';
	import { disputePhase } from '$lib/utils/dispute.utils';

	interface Props {
		dispute: Dispute;
		href?: string;
	}

	let { dispute, href }: Props = $props();

	let phase = $derived(disputePhase(dispute));

	// The deadline that's currently "live": evidence first, voting
	// second, the voting deadline as a finalize-window marker once the
	// dispute is resolved.
	let activeDeadlineNs = $derived(
		phase === DisputePhases.Evidence ? dispute.evidence_deadline_ns : dispute.voting_deadline_ns
	);
	let deadlineLabel = $derived(
		phase === DisputePhases.Evidence
			? $i18n.dispute.field_evidence_deadline
			: phase === DisputePhases.Voting
				? $i18n.dispute.field_voting_deadline
				: $i18n.dispute.field_resolved_at
	);
</script>

{#snippet body()}
	<header
		class="bg-danger text-default-inverse mx-[11px] mt-[11px] flex h-[24px] items-center justify-between rounded-[4px] px-[10px]"
	>
		<span class="font-sans text-[12px] leading-none font-semibold tracking-[0.48px]">
			{$i18n.dispute.deal_id_short.replace('{id}', dispute.deal_id.toString())}
		</span>
		<DisputePhaseBadge {phase} />
	</header>

	<div class="flex items-baseline justify-between px-[18px] pt-[14px]">
		<span class="text-default font-sans text-[16px] font-medium">{ICP_TOKEN.name}</span>
		<Money amount={dispute.arbitration_fee} size="md" />
	</div>

	<div class="flex items-center justify-between px-[18px] pt-[4px] pb-[14px]">
		<span class="text-default font-sans text-[14px] font-normal">
			{deadlineLabel}
		</span>
		<Countdown expiresAtNs={activeDeadlineNs} />
	</div>
{/snippet}

{#if href !== undefined}
	<a
		{href}
		data-tid="dispute-card"
		class="bg-bg-elevated shadow-deal-card block overflow-hidden rounded-[10px] transition-shadow hover:shadow-md"
	>
		{@render body()}
	</a>
{:else}
	<article
		data-tid="dispute-card"
		class="bg-bg-elevated shadow-deal-card overflow-hidden rounded-[10px]"
	>
		{@render body()}
	</article>
{/if}
