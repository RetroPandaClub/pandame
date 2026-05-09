<script lang="ts">
	import { DealStatuses, type DealStatusName } from '$lib/enums/deal-status';

	interface Props {
		status: DealStatusName;
	}

	let { status }: Props = $props();

	const STATUS_CLASS: Record<DealStatusName, string> = {
		[DealStatuses.Created]: 'bg-lavender-blue-100 text-lavender-blue-800',
		[DealStatuses.Funded]: 'bg-lavender-blue-500 text-white',
		[DealStatuses.Settled]: 'bg-black text-white',
		[DealStatuses.Refunded]: 'bg-lavender-blue-200 text-lavender-blue-900',
		[DealStatuses.Cancelled]: 'bg-white text-black',
		[DealStatuses.Rejected]: 'bg-white text-black'
	};

	let className = $derived(STATUS_CLASS[status]);
</script>

<span
	class="inline-flex items-center rounded-sm border-2 border-black px-2 py-0.5 text-xs font-semibold tracking-wide uppercase {className}"
>
	{status}
</span>
