<script lang="ts">
	import { ICP_TOKEN } from '$lib/constants/tokens.constants';
	import type { Token } from '$lib/types/token';
	import { formatTokenAmount } from '$lib/utils/format.utils';

	interface Props {
		amount: bigint;
		token?: Token;
		signed?: boolean;
		colorize?: boolean;
		size?: 'sm' | 'md' | 'lg';
		ariaLabel?: string;
	}

	let {
		amount,
		token = ICP_TOKEN,
		signed = false,
		colorize = false,
		size = 'md',
		ariaLabel
	}: Props = $props();

	const SIZE = {
		sm: 'text-body2',
		md: 'text-body1',
		lg: 'text-h6'
	};

	let formatted = $derived(formatTokenAmount(amount, token));
	let withSign = $derived.by(() => {
		if (!signed) {
			return formatted;
		}

		if (amount > 0n) {
			return `+${formatted}`;
		}

		return formatted;
	});

	let colorClass = $derived.by(() => {
		if (!colorize) {
			return '';
		}

		if (amount > 0n) {
			return 'text-success';
		}

		if (amount < 0n) {
			return 'text-danger';
		}

		return 'text-muted';
	});
</script>

<span
	class="font-mono font-bold tabular-nums {SIZE[size]} {colorClass}"
	aria-label={ariaLabel ?? withSign}
>
	{withSign}
</span>
