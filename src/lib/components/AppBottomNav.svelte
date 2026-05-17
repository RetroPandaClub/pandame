<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import HomeIcon from '$lib/components/icons/HomeIcon.svelte';
	import ProfileIcon from '$lib/components/icons/ProfileIcon.svelte';
	import SwapIcon from '$lib/components/icons/SwapIcon.svelte';
	import { dealsAttentionCount } from '$lib/derived/deals.derived';
	import { i18n } from '$lib/stores/i18n.store';

	let path = $derived(page.url.pathname);

	const isActive = (segment: string) => (segment === '/' ? path === '/' : path.startsWith(segment));

	let badgeLabel = $derived($dealsAttentionCount > 9 ? '9+' : String($dealsAttentionCount));

	let transactionsAriaLabel = $derived(
		$dealsAttentionCount > 0
			? $i18n.nav.transactions_attention.replace('{count}', String($dealsAttentionCount))
			: $i18n.nav.transactions
	);
</script>

<!-- Active vs inactive is conveyed by colour only — `text-primary`
     when on that route, `text-default` otherwise. -->
<BottomNav ariaLabel={$i18n.nav.aria_label}>
	{#snippet left()}
		<button
			type="button"
			aria-label={transactionsAriaLabel}
			aria-current={isActive('/transactions') ? 'page' : undefined}
			onclick={() => goto('/transactions')}
			class="relative flex h-[26px] w-[26px] items-center justify-center {isActive('/transactions')
				? 'text-primary'
				: 'text-default'}"
		>
			<SwapIcon />
			{#if $dealsAttentionCount > 0}
				<span
					aria-hidden="true"
					class="bg-danger text-default-inverse absolute -top-[6px] -right-[8px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-[4px] font-sans text-[10px] leading-none font-semibold"
				>
					{badgeLabel}
				</span>
			{/if}
		</button>
	{/snippet}

	{#snippet right()}
		<button
			type="button"
			aria-label={$i18n.nav.profile}
			aria-current={isActive('/profile') ? 'page' : undefined}
			onclick={() => goto('/profile')}
			class="flex h-[28px] w-[28px] items-center justify-center {isActive('/profile')
				? 'text-primary'
				: 'text-default'}"
		>
			<ProfileIcon />
		</button>
	{/snippet}

	{#snippet center()}
		<button
			type="button"
			aria-label={$i18n.nav.home}
			aria-current={isActive('/') ? 'page' : undefined}
			onclick={() => goto('/')}
			class="text-default flex h-full w-full items-center justify-center rounded-full"
		>
			<span class="flex h-[20px] w-[20px] items-center justify-center">
				<HomeIcon />
			</span>
		</button>
	{/snippet}
</BottomNav>
