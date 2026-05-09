<script lang="ts">
	import { ICP_TOKEN } from '$lib/constants/tokens.constants';
	import { balanceStore } from '$lib/stores/balance.store';
	import { formatTokenAmount } from '$lib/utils/format.utils';

	let formatted = $derived(
		$balanceStore !== undefined ? formatTokenAmount($balanceStore, ICP_TOKEN) : '— ICP'
	);
</script>

<span
	class="bg-bg text-default border-border-soft rounded-pill text-body2 inline-flex items-center gap-2 border px-3 py-1 font-bold"
	aria-label="Your ICP balance"
	data-tid="balance-badge"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="currentColor"
		aria-hidden="true"
	>
		<path d="M12 2 1 21h22L12 2zm0 4.5L19 19H5l7-12.5z" />
	</svg>
	{formatted}
</span>
