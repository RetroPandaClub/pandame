<script lang="ts">
	import { DealStatuses, type DealStatusName } from '$lib/enums/deal-status';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		status: DealStatusName;
	}

	let { status }: Props = $props();

	const STATUS = {
		[DealStatuses.Created]: { class: 'bg-primary-light text-default', icon: 'circle' },
		[DealStatuses.Funded]: { class: 'bg-primary text-default-inverse', icon: 'fund' },
		[DealStatuses.Settled]: { class: 'bg-success text-default-inverse', icon: 'check' },
		[DealStatuses.Refunded]: { class: 'bg-warning text-default-inverse', icon: 'refresh' },
		[DealStatuses.Cancelled]: { class: 'bg-muted text-default-inverse', icon: 'cross' },
		[DealStatuses.Rejected]: { class: 'bg-danger text-default-inverse', icon: 'cross' }
	} as const;

	let s = $derived(STATUS[status]);
	let label = $derived.by(() => {
		switch (status) {
			case DealStatuses.Created:
				return $i18n.deals.status.created;
			case DealStatuses.Funded:
				return $i18n.deals.status.funded;
			case DealStatuses.Settled:
				return $i18n.deals.status.settled;
			case DealStatuses.Refunded:
				return $i18n.deals.status.refunded;
			case DealStatuses.Cancelled:
				return $i18n.deals.status.cancelled;
			case DealStatuses.Rejected:
				return $i18n.deals.status.rejected;
		}
	});
</script>

<span
	class="inline-flex h-6 w-6 items-center justify-center rounded-full {s.class}"
	role="status"
	aria-label={label}
	title={label}
>
	{#if s.icon === 'check'}
		<svg
			viewBox="0 0 24 24"
			class="h-4 w-4"
			fill="none"
			stroke="currentColor"
			stroke-width="3"
			aria-hidden="true"
		>
			<path d="M5 12l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	{:else if s.icon === 'cross'}
		<svg
			viewBox="0 0 24 24"
			class="h-4 w-4"
			fill="none"
			stroke="currentColor"
			stroke-width="3"
			aria-hidden="true"
		>
			<path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
		</svg>
	{:else if s.icon === 'fund'}
		<svg
			viewBox="0 0 24 24"
			class="h-4 w-4"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			aria-hidden="true"
		>
			<path d="M4 8h13l-3-3M20 16H7l3 3" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	{:else if s.icon === 'refresh'}
		<svg
			viewBox="0 0 24 24"
			class="h-4 w-4"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			aria-hidden="true"
		>
			<path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	{:else}
		<span class="h-2.5 w-2.5 rounded-full bg-current" aria-hidden="true"></span>
	{/if}
</span>
