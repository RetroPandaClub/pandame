<script lang="ts">
	import { DealStatuses, type DealStatusName } from '$lib/enums/deal-status';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		status: DealStatusName;
	}

	let { status }: Props = $props();

	const STATUS_CLASS: Record<DealStatusName, string> = {
		[DealStatuses.Created]: 'bg-primary-light text-default',
		[DealStatuses.Funded]: 'bg-primary text-default-inverse',
		[DealStatuses.Settled]: 'bg-success text-default-inverse',
		[DealStatuses.Refunded]: 'bg-primary-light text-default',
		[DealStatuses.Cancelled]: 'bg-bg text-default',
		[DealStatuses.Rejected]: 'bg-bg text-default'
	};

	let className = $derived(STATUS_CLASS[status]);
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
	class="border-border-soft rounded-pill text-xxs inline-flex items-center border px-2 py-0.5 font-bold tracking-wide uppercase {className}"
>
	{label}
</span>
