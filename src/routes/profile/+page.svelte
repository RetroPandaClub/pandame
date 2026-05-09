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
	import { profileDisplayName } from '$lib/derived/profile.derived';
	import { userSignedIn } from '$lib/derived/user.derived';
	import { getReliability } from '$lib/services/deal.services';
	import { ensureProfile, getProfile } from '$lib/services/profile.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { profileStore } from '$lib/stores/profile.store';
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
			profileStore.reset();
			reliability = undefined;

			return;
		}

		(async () => {
			try {
				// Fast read-only fetch first so the screen paints with whatever
				// is already on chain; ensureProfile then back-fills a default
				// shell on first sign-in (and round-trips a `version` so
				// subsequent edits succeed).
				const initial = await getProfile(text);
				profileStore.set(initial);

				const ensured = await ensureProfile(text);
				profileStore.set(ensured);
			} catch (err) {
				console.error('Failed to load profile:', err);
			}
		})();

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
		<Avatar fallback={$profileDisplayName || principalShort} size="xl" alt={$profileDisplayName} />

		<div class="flex flex-col gap-1">
			<h2 class="text-h6 text-default font-bold">
				{$profileDisplayName || principalShort}
			</h2>
			<button
				type="button"
				onclick={copyPrincipal}
				class="text-body2 text-muted hover:bg-primary-light/50 rounded-md px-3 py-1 font-mono transition-colors"
				aria-label={$i18n.profile.copy_principal}
			>
				{copied ? $i18n.core.text.copied : principalShort}
			</button>
		</div>

		<Button variant="secondary" size="sm" onclick={() => goto('/profile/edit')}>
			{$i18n.profile.edit_cta}
		</Button>
	</div>

	{#if $profileStore !== undefined}
		<dl class="border-border-soft bg-bg text-body2 flex flex-col gap-2 rounded-xl border p-4">
			{#if $profileStore.data.email.length > 0}
				<div class="flex items-baseline justify-between gap-3">
					<dt class="text-muted">{$i18n.profile.email_label}</dt>
					<dd class="text-default truncate">{$profileStore.data.email}</dd>
				</div>
			{/if}
			{#if $profileStore.data.address.length > 0}
				<div class="flex items-baseline justify-between gap-3">
					<dt class="text-muted">{$i18n.profile.address_label}</dt>
					<dd class="text-default truncate">{$profileStore.data.address}</dd>
				</div>
			{/if}
		</dl>
	{/if}

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
