<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { goto } from '$app/navigation';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import LogoutConfirmModal from '$lib/components/LogoutConfirmModal.svelte';
	import ProfileFieldRow from '$lib/components/ProfileFieldRow.svelte';
	import Sheet from '$lib/components/Sheet.svelte';
	import UserPrincipalBadge from '$lib/components/UserPrincipalBadge.svelte';
	import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
	import { profileDisplayName } from '$lib/derived/profile.derived';
	import { userPrincipalShort, userPrincipalText } from '$lib/derived/user.derived';
	import { ensureProfile, upsertProfile } from '$lib/services/profile.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { profileStore } from '$lib/stores/profile.store';
	import type { UserProfile } from '$lib/types/profile';

	let principalText = $derived($userPrincipalText);
	let logoutOpen = $state(false);
	let saveError: string | undefined = $state(undefined);

	let profile = $derived($profileStore?.data);

	let username = $state('');
	let name = $state('');
	let surname = $state('');
	let address = $state('');
	let email = $state('');

	$effect(() => {
		const text = principalText;
		if (text === undefined || text.length === 0) {
			profileStore.reset();
			return;
		}
		(async () => {
			try {
				const doc = await ensureProfile(text);
				profileStore.set(doc);
			} catch (err) {
				console.error('Failed to ensure profile:', err);
			}
		})();
	});

	$effect(() => {
		if (profile === undefined) {
			return;
		}
		username = profile.username;
		name = profile.name;
		surname = profile.surname;
		address = profile.address;
		email = profile.email;
	});

	const isValidEmail = (text: string) => text.length === 0 || /[^@\s]+@[^@\s]+\.[^@\s]+/.test(text);

	const save = async (next: Partial<UserProfile>) => {
		const text = principalText;
		if (text === undefined || text.length === 0) {
			return;
		}
		if (next.email !== undefined && !isValidEmail(next.email)) {
			saveError = $i18n.profile.email_invalid;
			return;
		}
		saveError = undefined;
		try {
			const merged: UserProfile = {
				...(profile ?? {
					owner: text,
					username: '',
					name: '',
					surname: '',
					address: '',
					email: ''
				}),
				...next,
				owner: text
			};
			const updated = await upsertProfile({ key: text, data: merged });
			profileStore.set(updated);
		} catch (err) {
			console.error('Failed to save profile:', err);
			saveError = $i18n.profile.edit_save_error;
		}
	};
</script>

<svelte:head>
	<title>{$i18n.profile.title} · {$i18n.layout.title}</title>
</svelte:head>

<AuthGuard />

<BrandHeader title={$i18n.profile.title} subtitle={$i18n.profile.role_user} tone="success">
	{#snippet trailing()}
		<UserPrincipalBadge />
	{/snippet}
</BrandHeader>

<Sheet paddingClass="px-[25px] pt-[80px] pb-[120px]" class="gap-[18px]">
	<!--
    Big 134 × 134 avatar overlapping the green→white seam, with a
    purple `+` badge floating bottom-right. Positioned absolutely so
    it bleeds out of the Sheet's top edge.
  -->
	<div class="absolute -top-[60px] left-1/2 -translate-x-1/2">
		<div class="relative">
			<Avatar size="xl" fallback={$profileDisplayName || $userPrincipalShort} />
			<button
				type="button"
				class="bg-primary-stroke text-default-inverse shadow-deal-card absolute right-[6px] bottom-[6px] flex h-[30px] w-[30px] items-center justify-center rounded-full"
				aria-label={$i18n.profile.add_avatar_aria}
				onclick={() => {
					/* TODO: avatar upload */
				}}
			>
				<span class="flex h-[15px] w-[15px] items-center"><PlusIcon /></span>
			</button>
		</div>
	</div>

	<header class="flex items-center">
		<h2 class="text-default text-h6 font-sans font-semibold">{$i18n.profile.section_edit}</h2>
	</header>

	<div class="flex flex-col gap-[22px]">
		<ProfileFieldRow
			id="profile-username"
			label={$i18n.profile.username_label}
			placeholder={$i18n.profile.username_placeholder}
			bind:value={username}
			onsave={(next) => save({ username: next })}
		/>
		<ProfileFieldRow
			id="profile-name"
			label={$i18n.profile.name_label}
			placeholder={$i18n.profile.name_placeholder}
			bind:value={name}
			onsave={(next) => save({ name: next })}
		/>
		<ProfileFieldRow
			id="profile-surname"
			label={$i18n.profile.surname_label}
			placeholder={$i18n.profile.surname_placeholder}
			bind:value={surname}
			onsave={(next) => save({ surname: next })}
		/>
		<ProfileFieldRow
			id="profile-address"
			label={$i18n.profile.address_label}
			placeholder={$i18n.profile.address_placeholder}
			bind:value={address}
			onsave={(next) => save({ address: next })}
		/>
		<ProfileFieldRow
			id="profile-email"
			label={$i18n.profile.email_label}
			placeholder={$i18n.profile.email_placeholder}
			bind:value={email}
			onsave={(next) => save({ email: next })}
		/>
		<ProfileFieldRow
			id="profile-reliability"
			label={$i18n.profile.reliability_label}
			value={$i18n.profile.reliability_yes}
			editable={false}
		/>
		<ProfileFieldRow
			id="profile-weight"
			label={$i18n.profile.weight_label}
			value="3"
			editable={false}
		/>
	</div>

	{#if saveError !== undefined}
		<p class="text-danger text-body2" role="alert">{saveError}</p>
	{/if}

	<div class="mt-auto flex flex-col gap-[10px] pt-[20px]">
		<button
			type="button"
			onclick={() => (logoutOpen = true)}
			class="text-link-purple font-sans text-[15px] font-light underline-offset-2 hover:underline"
		>
			{$i18n.core.text.sign_out}
		</button>
		<button
			type="button"
			onclick={async () => {
				await goto('/history');
			}}
			class="text-default font-sans text-[14px] font-medium hover:underline"
		>
			{$i18n.profile.history_action}
		</button>
	</div>
</Sheet>

<AppBottomNav />

<LogoutConfirmModal open={logoutOpen} onclose={() => (logoutOpen = false)} />

{#if nonNullish(profile)}
	<!-- profile is loaded; nothing extra to render here, but the
	     reactive subscription is what keeps the form in sync. -->
{/if}
