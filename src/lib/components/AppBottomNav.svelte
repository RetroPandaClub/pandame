<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import HomeIcon from '$lib/components/icons/HomeIcon.svelte';
	import ProfileIcon from '$lib/components/icons/ProfileIcon.svelte';
	import SwapIcon from '$lib/components/icons/SwapIcon.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	const open = (href: string) => async () => {
		await goto(href);
	};

	let path = $derived(page.url.pathname);
</script>

<BottomNav ariaLabel={$i18n.nav.aria_label}>
	{#snippet left()}
		<IconButton
			ariaLabel={$i18n.nav.send}
			variant={path.startsWith('/send') ? 'secondary' : 'ghost'}
			onclick={open('/send')}
		>
			<SwapIcon />
		</IconButton>
	{/snippet}

	{#snippet right()}
		<IconButton
			ariaLabel={$i18n.nav.profile}
			variant={path.startsWith('/profile') ? 'secondary' : 'ghost'}
			onclick={open('/profile')}
		>
			<ProfileIcon />
		</IconButton>
	{/snippet}

	{#snippet center()}
		<IconButton
			ariaLabel={$i18n.nav.home}
			variant={path === '/' ? 'primary' : 'floating'}
			size="lg"
			onclick={open('/')}
		>
			<HomeIcon />
		</IconButton>
	{/snippet}
</BottomNav>
