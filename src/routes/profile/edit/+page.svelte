<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { goto } from '$app/navigation';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import AvatarUploadSheet from '$lib/components/AvatarUploadSheet.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import ProfileFieldRow from '$lib/components/ProfileFieldRow.svelte';
	import Sheet from '$lib/components/Sheet.svelte';
	import UserPrincipalBadge from '$lib/components/UserPrincipalBadge.svelte';
	import BackIcon from '$lib/components/icons/BackIcon.svelte';
	import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
	import { profileDisplayName } from '$lib/derived/profile.derived';
	import { userPrincipalShort, userPrincipalText } from '$lib/derived/user.derived';
	import { ensureProfile, upsertProfile } from '$lib/services/profile.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { profileStore } from '$lib/stores/profile.store';
	import type { UserProfile } from '$lib/types/profile';
	import { defaultAvatarUrlForPrincipal } from '$lib/utils/avatar.utils';
	import { AvatarPipelineError, fileToAvatarDataUrl } from '$lib/utils/image.utils';

	let principalText = $derived($userPrincipalText);
	let saveError: string | undefined = $state(undefined);

	let profile = $derived($profileStore?.data);
	let avatarUrl = $derived(profile?.avatar_url);

	let avatarSheetOpen = $state(false);
	let avatarUploading = $state(false);

	let username = $state('');
	let name = $state('');
	let surname = $state('');

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
	});

	const save = async (next: Partial<UserProfile>) => {
		const text = principalText;
		if (text === undefined || text.length === 0) {
			return;
		}
		saveError = undefined;
		try {
			const merged: UserProfile = {
				...(profile ?? {
					owner: text,
					username: '',
					name: '',
					surname: ''
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

	const onAvatarPicked = async (file: File) => {
		saveError = undefined;
		avatarUploading = true;
		try {
			const dataUrl = await fileToAvatarDataUrl(file);
			await save({ avatar_url: dataUrl });
			avatarSheetOpen = false;
		} catch (err) {
			if (err instanceof AvatarPipelineError) {
				saveError =
					err.reason === 'too-large'
						? $i18n.profile.avatar_too_large
						: $i18n.profile.avatar_invalid;
			} else {
				saveError = $i18n.profile.edit_save_error;
			}
			console.error('Failed to set avatar:', err);
		} finally {
			avatarUploading = false;
		}
	};

	const onAvatarPickedDefault = async () => {
		const text = principalText;
		if (text === undefined || text.length === 0) {
			return;
		}
		saveError = undefined;
		avatarUploading = true;
		try {
			await save({ avatar_url: defaultAvatarUrlForPrincipal(text) });
			avatarSheetOpen = false;
		} finally {
			avatarUploading = false;
		}
	};
</script>

<svelte:head>
	<title>{$i18n.profile.title} · {$i18n.layout.title}</title>
</svelte:head>

<AuthGuard />

<BrandHeader title={$i18n.profile.section_edit} tone="success">
	{#snippet leading()}
		<button
			type="button"
			aria-label={$i18n.core.text.back_to_dashboard}
			onclick={() => goto('/profile')}
			class="text-default-inverse flex h-[24px] w-[24px] items-center justify-center"
		>
			<BackIcon />
		</button>
	{/snippet}

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
			<Avatar
				size="xl"
				src={avatarUrl}
				alt={$profileDisplayName || $userPrincipalShort}
				fallback={$profileDisplayName || $userPrincipalShort}
			/>
			<button
				type="button"
				class="bg-primary-stroke text-default-inverse shadow-deal-card absolute right-[6px] bottom-[6px] flex h-[30px] w-[30px] items-center justify-center rounded-full disabled:opacity-40"
				aria-label={$i18n.profile.add_avatar_aria}
				disabled={avatarUploading}
				onclick={() => (avatarSheetOpen = true)}
			>
				<span class="flex h-[15px] w-[15px] items-center"><PlusIcon /></span>
			</button>
		</div>
	</div>

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
</Sheet>

<AppBottomNav />

<AvatarUploadSheet
	open={avatarSheetOpen}
	busy={avatarUploading}
	onclose={() => (avatarSheetOpen = false)}
	onpicked={onAvatarPicked}
	onpickeddefault={onAvatarPickedDefault}
/>

{#if nonNullish(profile)}
	<!-- profile is loaded; nothing extra to render here, but the
	     reactive subscription is what keeps the form in sync. -->
{/if}
