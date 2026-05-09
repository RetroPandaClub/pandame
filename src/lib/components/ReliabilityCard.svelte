<script lang="ts">
	import { fromNullable } from '@dfinity/utils';
	import type { EscrowDid } from '$declarations';
	import Chip from '$lib/components/Chip.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		reliability?: EscrowDid.ReliabilityView;
	}

	let { reliability }: Props = $props();

	let score = $derived(reliability !== undefined ? fromNullable(reliability.score) : undefined);
	let concluded = $derived(reliability?.concluded ?? 0);
	let positive = $derived(reliability?.positive ?? 0);

	let scoreVariant = $derived.by((): 'success' | 'warning' | 'danger' | 'soft' => {
		if (score === undefined) {
			return 'soft';
		}

		if (score >= 80) {
			return 'success';
		}

		if (score >= 50) {
			return 'warning';
		}

		return 'danger';
	});
</script>

<div class="border-border-soft bg-bg flex flex-col gap-3 rounded-xl border p-4">
	<div class="flex items-center justify-between">
		<span class="text-body2 text-muted">{$i18n.profile.reliability_score}</span>
		{#if score === undefined}
			<Chip variant="soft">{$i18n.profile.reliability_pending}</Chip>
		{:else}
			<Chip variant={scoreVariant}>{score} / 100</Chip>
		{/if}
	</div>
	<div class="flex items-baseline justify-between">
		<span class="text-body2 text-muted">{$i18n.profile.reliability_concluded}</span>
		<span class="text-default font-mono font-bold">{concluded}</span>
	</div>
	<div class="flex items-baseline justify-between">
		<span class="text-body2 text-muted">{$i18n.profile.reliability_positive}</span>
		<span class="text-default font-mono font-bold">{positive}</span>
	</div>
</div>
