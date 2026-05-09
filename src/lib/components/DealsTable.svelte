<script lang="ts">
	import DealRow from '$lib/components/DealRow.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { dealsLoaded } from '$lib/derived/deals.derived';
	import { dealsStore } from '$lib/stores/deals.store';
</script>

<section class="space-y-4" aria-label="Your deals">
	{#if !$dealsLoaded}
		<p class="text-sm opacity-60">Loading your deals…</p>
	{:else if ($dealsStore?.length ?? 0) === 0}
		<EmptyState
			title="No deals yet"
			description="Create your first escrow deal to lock funds against a recipient or share a tip link."
		/>
	{:else}
		<ul class="space-y-3">
			{#each $dealsStore ?? [] as deal (deal.id)}
				<li>
					<DealRow {deal} />
				</li>
			{/each}
		</ul>
	{/if}
</section>
