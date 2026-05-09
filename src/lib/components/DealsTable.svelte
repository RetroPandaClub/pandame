<script lang="ts">
	import DealCard from '$lib/components/DealCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { dealsLoaded } from '$lib/derived/deals.derived';
	import { dealsStore } from '$lib/stores/deals.store';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<section class="flex flex-col gap-3" aria-label="Your deals">
	{#if !$dealsLoaded}
		<p class="text-body2 text-muted" aria-live="polite">{$i18n.core.text.loading}</p>
	{:else if ($dealsStore?.length ?? 0) === 0}
		<EmptyState title={$i18n.deals.empty_title} description={$i18n.deals.empty_description} />
	{:else}
		<ul class="flex flex-col gap-3">
			{#each $dealsStore ?? [] as deal (deal.id)}
				<li>
					<DealCard {deal} />
				</li>
			{/each}
		</ul>
	{/if}
</section>
