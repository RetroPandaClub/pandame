<script lang="ts">
	import { goto } from '$app/navigation';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<svelte:head>
	<title>{$i18n.send.title} · {$i18n.layout.title}</title>
</svelte:head>

<BrandHeader title={$i18n.send.title}>
	{#snippet leading()}
		<IconButton
			ariaLabel={$i18n.core.text.back_to_dashboard}
			variant="ghost"
			onclick={() => goto('/')}
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M15 18l-6-6 6-6" />
			</svg>
		</IconButton>
	{/snippet}
</BrandHeader>

<section class="flex flex-1 flex-col px-6 pt-8 pb-28">
	<EmptyState
		title={$i18n.send.coming_soon_title}
		description={$i18n.send.coming_soon_description}
	/>
</section>

<AppBottomNav />
