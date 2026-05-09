<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { nsToDate } from '$lib/utils/format.utils';

	interface Props {
		expiresAtNs: bigint;
		expiredLabel?: string;
		updateMs?: number;
	}

	let { expiresAtNs, expiredLabel, updateMs = 1_000 }: Props = $props();

	let nowMs = $state(Date.now());

	$effect(() => {
		const id = window.setInterval(() => {
			nowMs = Date.now();
		}, updateMs);

		return () => window.clearInterval(id);
	});

	let target = $derived(nsToDate(expiresAtNs).getTime());
	let remainingMs = $derived(Math.max(0, target - nowMs));
	let expired = $derived(remainingMs === 0);

	let display = $derived.by(() => {
		const totalSeconds = Math.floor(remainingMs / 1_000);
		const days = Math.floor(totalSeconds / 86_400);
		const h = Math.floor((totalSeconds % 86_400) / 3_600);
		const m = Math.floor((totalSeconds % 3_600) / 60);
		const s = totalSeconds % 60;

		const pad = (n: number) => n.toString().padStart(2, '0');

		if (days > 0) {
			return `${days}d ${pad(h)}h ${pad(m)}m`;
		}

		return `h${h}:${pad(m)}:${pad(s)}`;
	});
</script>

<time
	datetime={new Date(target).toISOString()}
	class="font-mono tabular-nums {expired ? 'text-danger' : 'text-default'}"
>
	{#if expired}
		{expiredLabel ?? $i18n.deals.status.refunded}
	{:else}
		{display}
	{/if}
</time>
