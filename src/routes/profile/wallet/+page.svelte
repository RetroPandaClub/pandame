<script lang="ts">
	import { goto } from '$app/navigation';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import BrandHeaderBackButton from '$lib/components/BrandHeaderBackButton.svelte';
	import Sheet from '$lib/components/Sheet.svelte';
	import UserPrincipalBadge from '$lib/components/UserPrincipalBadge.svelte';
	import WalletTokenList from '$lib/components/WalletTokenList.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<svelte:head>
	<title>{$i18n.wallet.title} · {$i18n.layout.title}</title>
</svelte:head>

<AuthGuard />

<BrandHeader title={$i18n.wallet.title} subtitle={$i18n.wallet.subtitle} tone="success">
	{#snippet leading()}
		<BrandHeaderBackButton onclick={() => goto('/profile')} />
	{/snippet}

	{#snippet trailing()}
		<UserPrincipalBadge />
	{/snippet}
</BrandHeader>

<Sheet paddingClass="px-[34px] pt-[26px] pb-[120px]" class="gap-[20px]">
	<WalletTokenList />
</Sheet>

<AppBottomNav />
