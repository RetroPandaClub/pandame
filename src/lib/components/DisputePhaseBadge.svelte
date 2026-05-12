<script lang="ts">
	import { DisputePhases, type DisputePhaseName } from '$lib/enums/dispute';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		phase: DisputePhaseName;
		ariaLabel?: string;
	}

	let { phase, ariaLabel }: Props = $props();

	// 24 px circular phase chip — colour conveys urgency:
	//   Evidence  = warning amber  (still gathering proofs)
	//   Voting    = primary purple (panel deliberating)
	//   Resolved  = success green  (terminal — outcome propagated)
	const PHASE_CLASS: Record<DisputePhaseName, string> = {
		[DisputePhases.Evidence]: 'bg-warning text-default-inverse',
		[DisputePhases.Voting]: 'bg-primary text-default-inverse',
		[DisputePhases.Resolved]: 'bg-success text-default-inverse'
	};

	const PHASE_LABEL: Record<DisputePhaseName, () => string> = {
		[DisputePhases.Evidence]: () => $i18n.dispute.phase_evidence,
		[DisputePhases.Voting]: () => $i18n.dispute.phase_voting,
		[DisputePhases.Resolved]: () => $i18n.dispute.phase_resolved
	};
</script>

<span
	class="inline-flex h-[24px] items-center justify-center rounded-full px-[12px] font-sans text-[10px] font-semibold tracking-[0.4px] {PHASE_CLASS[
		phase
	]}"
	role="img"
	aria-label={ariaLabel ?? PHASE_LABEL[phase]()}
>
	{PHASE_LABEL[phase]()}
</span>
