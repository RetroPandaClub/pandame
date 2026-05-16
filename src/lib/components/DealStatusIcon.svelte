<script lang="ts">
	import { DealStatuses, type DealStatusName } from '$lib/enums/deal-status';

	interface Props {
		status: DealStatusName;
		ariaLabel?: string;
	}

	let { status, ariaLabel }: Props = $props();

	interface Spec {
		class: string;
		glyph: 'check' | 'cross' | 'dot' | 'swap' | 'refresh' | 'gavel';
	}

	// 24 px circular status badge that sits on the right of the
	// DealCard title bar. Glyph + colour per status:
	//   Settled            = green check
	//   ArbitratedSettled  = green check (arbitrated CC outcome — same
	//                        terminal flavour as Settled)
	//   Rejected           = red cross
	//   Cancelled          = muted cross (less alarming than rejection)
	//   Aborted            = warning cross (mutual two-signature `No` →
	//                        refund; distinct from Refunded so users
	//                        can see "both parties agreed to abort" at
	//                        a glance)
	//   Refunded           = warning dot
	//   ArbitratedRefunded = warning dot (arbitrated IC / no-quorum
	//                        outcome — funds back to payer)
	//   Funded             = white-bg blue swap-arrows ("in progress")
	//   Created            = warning refresh
	//   Disputed           = danger gavel ("a panel is reviewing this")
	const SPEC: Record<DealStatusName, Spec> = {
		[DealStatuses.Settled]: { class: 'bg-success', glyph: 'check' },
		[DealStatuses.ArbitratedSettled]: { class: 'bg-success', glyph: 'check' },
		[DealStatuses.Rejected]: { class: 'bg-danger', glyph: 'cross' },
		[DealStatuses.Cancelled]: { class: 'bg-muted', glyph: 'cross' },
		[DealStatuses.Aborted]: { class: 'bg-warning', glyph: 'cross' },
		[DealStatuses.Refunded]: { class: 'bg-warning', glyph: 'dot' },
		[DealStatuses.ArbitratedRefunded]: { class: 'bg-warning', glyph: 'dot' },
		[DealStatuses.Funded]: { class: 'bg-bg-elevated', glyph: 'swap' },
		[DealStatuses.Created]: { class: 'bg-warning', glyph: 'refresh' },
		[DealStatuses.Disputed]: { class: 'bg-danger', glyph: 'gavel' }
	};

	let spec = $derived(SPEC[status]);
</script>

<span
	class="text-default-inverse inline-flex h-[24px] w-[24px] items-center justify-center rounded-full {spec.class}"
	role="img"
	aria-label={ariaLabel ?? status}
>
	{#if spec.glyph === 'check'}
		<svg
			viewBox="0 0 24 24"
			class="h-3.5 w-3.5"
			fill="none"
			stroke="currentColor"
			stroke-width="3"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<polyline points="5,12 10,17 19,7" />
		</svg>
	{:else if spec.glyph === 'cross'}
		<svg
			viewBox="0 0 24 24"
			class="h-3.5 w-3.5"
			fill="none"
			stroke="currentColor"
			stroke-width="3"
			stroke-linecap="round"
			aria-hidden="true"
		>
			<line x1="6" y1="6" x2="18" y2="18" />
			<line x1="6" y1="18" x2="18" y2="6" />
		</svg>
	{:else if spec.glyph === 'swap'}
		<svg
			viewBox="0 0 24 24"
			class="text-primary h-3.5 w-3.5"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<polyline points="7,4 4,7 7,10" />
			<line x1="4" y1="7" x2="19" y2="7" />
			<polyline points="17,14 20,17 17,20" />
			<line x1="5" y1="17" x2="20" y2="17" />
		</svg>
	{:else if spec.glyph === 'refresh'}
		<svg
			viewBox="0 0 24 24"
			class="h-3.5 w-3.5"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<polyline points="20,6 14,6 14,12" />
			<path d="M20 6a8 8 0 1 1-2.5 11" />
		</svg>
	{:else if spec.glyph === 'gavel'}
		<svg
			viewBox="0 0 24 24"
			class="h-3.5 w-3.5"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<line x1="14" y1="13" x2="20" y2="19" />
			<path d="M9 8l5 5" />
			<path d="M11 4l7 7-3 3-7-7z" />
			<line x1="3" y1="21" x2="13" y2="21" />
		</svg>
	{:else}
		<span class="block h-2 w-2 rounded-full bg-current"></span>
	{/if}
</span>
