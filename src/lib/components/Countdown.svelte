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

	// Urgency tiers (right-open intervals): >1d default, ≤1d orange,
	// ≤1h red, ≤10m red + pulse. `motion-safe:` so users with reduced
	// motion still get the colour cue without the animation.
	const TEN_MINUTES_MS = 600_000;
	const ONE_HOUR_MS = 3_600_000;
	const ONE_DAY_MS = 86_400_000;

	let toneClass = $derived.by(() => {
		if (expired) {
			return 'text-danger';
		}
		if (remainingMs < TEN_MINUTES_MS) {
			return 'text-danger motion-safe:animate-pulse';
		}
		if (remainingMs < ONE_HOUR_MS) {
			return 'text-danger';
		}
		if (remainingMs < ONE_DAY_MS) {
			return 'text-warning';
		}
		return 'text-default';
	});

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

		if (h > 0) {
			return `${h}h ${pad(m)}m ${pad(s)}s`;
		}

		if (m > 0) {
			return `${m}m ${pad(s)}s`;
		}

		return `${s}s`;
	});
</script>

<time datetime={new Date(target).toISOString()} class="font-mono tabular-nums {toneClass}">
	{#if expired}
		{expiredLabel ?? $i18n.deals.status.refunded}
	{:else}
		{display}
	{/if}
</time>
