<script lang="ts">
	import { signOut } from '@junobuild/core';
	import { goto } from '$app/navigation';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import Button from '$lib/components/Button.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import { userSignedIn } from '$lib/derived/user.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { userStore } from '$lib/stores/user.store';
	import { shortPrincipal } from '$lib/utils/format.utils';

	let principal = $derived($userStore?.key);
	let principalShort = $derived(principal !== undefined ? shortPrincipal(principal) : '');
	let copied = $state(false);

	$effect(() => {
		if (!$userSignedIn) {
			goto('/');
		}
	});

	const copyPrincipal = async () => {
		if (principal === undefined) {
			return;
		}

		try {
			await navigator.clipboard.writeText(principal);
			copied = true;
			setTimeout(() => (copied = false), 2_000);
		} catch (err) {
			console.error('Failed to copy principal:', err);
		}
	};

	const onSignOut = () => signOut();
</script>

<svelte:head>
	<title>{$i18n.profile.title} · {$i18n.layout.title}</title>
</svelte:head>

<BrandHeader title={$i18n.profile.title}>
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

<section class="flex flex-1 flex-col items-center gap-6 px-6 pt-8 pb-28 text-center">
	<Avatar fallback={principalShort} size="xl" alt={principalShort} />

	<div class="flex flex-col gap-1">
		<span class="text-body2 text-muted">{$i18n.profile.principal_label}</span>
		<button
			type="button"
			onclick={copyPrincipal}
			class="text-body1 text-default hover:bg-primary-light/50 rounded-md px-3 py-1 font-mono font-bold transition-colors"
			aria-label={$i18n.profile.copy_principal}
		>
			{copied ? $i18n.core.text.copied : principalShort}
		</button>
	</div>

	<div class="mt-auto w-full">
		<Button variant="secondary" fullWidth onclick={onSignOut}>
			{$i18n.core.text.sign_out}
		</Button>
	</div>
</section>

<AppBottomNav />
