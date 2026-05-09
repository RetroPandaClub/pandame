<script lang="ts">
	import { DealStatuses, type DealStatusName } from '$lib/enums/deal-status';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		status: DealStatusName;
	}

	let { status }: Props = $props();

	const STATUS_CLASS: Record<DealStatusName, string> = {
		[DealStatuses.Created]: 'bg-primary-light text-default',
		[DealStatuses.Funded]: 'bg-primary text-white',
		[DealStatuses.Settled]: 'bg-success text-white',
		[DealStatuses.Refunded]: 'bg-primary-light text-default',
		[DealStatuses.Cancelled]: 'bg-white text-default',
		[DealStatuses.Rejected]: 'bg-white text-default'
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
	class="inline-flex items-center rounded-sm border-2 border-black px-2 py-0.5 text-xs font-semibold tracking-wide uppercase {className}"
>
	{label}
</span>
