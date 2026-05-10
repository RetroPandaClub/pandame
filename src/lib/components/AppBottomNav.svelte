<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import HomeIcon from '$lib/components/icons/HomeIcon.svelte';
	import ProfileIcon from '$lib/components/icons/ProfileIcon.svelte';
	import SwapIcon from '$lib/components/icons/SwapIcon.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	let path = $derived(page.url.pathname);

	const isActive = (segment: string) => (segment === '/' ? path === '/' : path.startsWith(segment));
</script>

<!-- Active vs inactive is conveyed by colour only — `text-primary`
     when on that route, `text-default` otherwise. -->
<BottomNav ariaLabel={$i18n.nav.aria_label}>
	{#snippet left()}
		<button
			type="button"
			aria-label={$i18n.nav.transactions}
			aria-current={isActive('/transactions') ? 'page' : undefined}
			onclick={() => goto('/transactions')}
			class="flex h-[26px] w-[26px] items-center justify-center {isActive('/transactions')
				? 'text-primary'
				: 'text-default'}"
		>
			<SwapIcon />
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
			class="text-default flex h-[20px] w-[20px] items-center justify-center"
		>
			<HomeIcon />
		</button>
	{/snippet}
</BottomNav>
