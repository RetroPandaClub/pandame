<script lang="ts">
	import { Principal } from '@icp-sdk/core/principal';
	import { goto } from '$app/navigation';
	import type { EscrowDid } from '$declarations';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import Button from '$lib/components/Button.svelte';
	import Chip from '$lib/components/Chip.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import LogoutConfirmModal from '$lib/components/LogoutConfirmModal.svelte';
	import ReliabilityCard from '$lib/components/ReliabilityCard.svelte';
	import RoleSwitcher from '$lib/components/RoleSwitcher.svelte';
	import { userSignedIn } from '$lib/derived/user.derived';
	import { getReliability } from '$lib/services/deal.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { userStore } from '$lib/stores/user.store';
	import { shortPrincipal } from '$lib/utils/format.utils';

	let principalText = $derived($userStore?.key);
	let principalShort = $derived(principalText !== undefined ? shortPrincipal(principalText) : '');
	let copied = $state(false);
	let logoutOpen = $state(false);

	let reliability: EscrowDid.ReliabilityView | undefined = $state(undefined);

	$effect(() => {
		if (!$userSignedIn) {
			goto('/');
		}
	});

	$effect(() => {
		const text = principalText;

		if (text === undefined || text.length === 0) {
			reliability = undefined;

			return;
		}

		(async () => {
			try {
				reliability = await getReliability({ principal: Principal.fromText(text) });
			} catch (err) {
				console.error('getReliability failed:', err);
				reliability = undefined;
			}
		})();
	});

	const copyPrincipal = async () => {
		if (principalText === undefined) {
			return;
		}

		try {
			await navigator.clipboard.writeText(principalText);
			copied = true;
			setTimeout(() => (copied = false), 2_000);
		} catch (err) {
			console.error('Failed to copy principal:', err);
		}
	};
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

	{#snippet trailing()}
		<Chip variant="soft">{$i18n.profile.role_user}</Chip>
	{/snippet}
</BrandHeader>

<section class="flex flex-1 flex-col gap-5 px-6 pt-6 pb-28">
	<div class="flex justify-center">
		<RoleSwitcher current="user" />
	</div>

	<div class="flex flex-col items-center gap-3 text-center">
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

		<Button variant="secondary" size="sm" onclick={() => goto('/profile/edit')}>
			{$i18n.profile.edit_cta}
		</Button>
	</div>

	<ReliabilityCard {reliability} />

	<div class="mt-auto flex flex-col gap-2">
		<Button
			variant="ghost"
			fullWidth
			onclick={() => {
				logoutOpen = true;
			}}
		>
			{$i18n.core.text.sign_out}
		</Button>
	</div>
</section>

<AppBottomNav />

<LogoutConfirmModal open={logoutOpen} onclose={() => (logoutOpen = false)} />
