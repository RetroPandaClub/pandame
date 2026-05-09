<script lang="ts">
	import DealRow from '$lib/components/DealRow.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { dealsLoaded } from '$lib/derived/deals.derived';
	import { dealsStore } from '$lib/stores/deals.store';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<section class="space-y-4" aria-label="Your deals">
	{#if !$dealsLoaded}
		<p class="text-sm opacity-60">{$i18n.core.text.loading}</p>
	{:else if ($dealsStore?.length ?? 0) === 0}
		<EmptyState title={$i18n.deals.empty_title} description={$i18n.deals.empty_description} />
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
