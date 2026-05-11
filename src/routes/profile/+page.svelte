<script lang="ts">
	import { goto } from '$app/navigation';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import AvatarUploadSheet from '$lib/components/AvatarUploadSheet.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import LogoutConfirmModal from '$lib/components/LogoutConfirmModal.svelte';
	import Sheet from '$lib/components/Sheet.svelte';
	import UserPrincipalBadge from '$lib/components/UserPrincipalBadge.svelte';
	import PencilIcon from '$lib/components/icons/PencilIcon.svelte';
	import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
	import { profileDisplayName } from '$lib/derived/profile.derived';
	import { userPrincipalShort, userPrincipalText } from '$lib/derived/user.derived';
	import { ensureProfile, upsertProfile } from '$lib/services/profile.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { profileStore } from '$lib/stores/profile.store';
	import { AvatarPipelineError, fileToAvatarDataUrl } from '$lib/utils/image.utils';

	let principalText = $derived($userPrincipalText);
	let logoutOpen = $state(false);

	let profile = $derived($profileStore?.data);
	let avatarUrl = $derived(profile?.avatar_url);

	let avatarSheetOpen = $state(false);
	let avatarUploading = $state(false);
	let avatarError: string | undefined = $state(undefined);

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

	const onAvatarPicked = async (file: File) => {
		const text = principalText;
		if (text === undefined || text.length === 0) {
			return;
		}
		avatarError = undefined;
		avatarUploading = true;
		try {
			const dataUrl = await fileToAvatarDataUrl(file);
			const updated = await upsertProfile({
				key: text,
				data: {
					...(profile ?? { owner: text, username: '', name: '', surname: '' }),
					avatar_url: dataUrl,
					owner: text
				}
			});
			profileStore.set(updated);
			avatarSheetOpen = false;
		} catch (err) {
			if (err instanceof AvatarPipelineError) {
				avatarError =
					err.reason === 'too-large'
						? $i18n.profile.avatar_too_large
						: $i18n.profile.avatar_invalid;
			} else {
				avatarError = $i18n.profile.edit_save_error;
			}
			console.error('Failed to set avatar:', err);
		} finally {
			avatarUploading = false;
		}
	};
</script>

<svelte:head>
	<title>{$i18n.profile.title} · {$i18n.layout.title}</title>
</svelte:head>

<AuthGuard />

<BrandHeader title={$i18n.profile.title} tone="success">
	{#snippet trailing()}
		<UserPrincipalBadge />
	{/snippet}
</BrandHeader>

<Sheet paddingClass="px-[34px] pt-[80px] pb-[120px]" class="gap-[28px]">
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

	{#if avatarError !== undefined}
		<p class="text-danger text-body2 text-center" role="alert">{avatarError}</p>
	{/if}

	<nav class="flex flex-col gap-[18px]" aria-label={$i18n.profile.title}>
		<button
			type="button"
			onclick={async () => {
				await goto('/profile/edit');
			}}
			class="text-default flex items-center justify-between border-b border-[var(--color-border-soft)] py-[14px] font-sans text-[18px] font-normal transition-opacity hover:opacity-70"
		>
			<span class="flex items-center gap-[14px]">
				<span class="text-primary-stroke flex h-[20px] w-[20px] items-center"><PencilIcon /></span>
				{$i18n.profile.section_edit}
			</span>
			<span class="text-subtle font-sans text-[20px]" aria-hidden="true">›</span>
		</button>

		<button
			type="button"
			onclick={async () => {
				await goto('/history');
			}}
			class="text-default flex items-center justify-between border-b border-[var(--color-border-soft)] py-[14px] font-sans text-[18px] font-normal transition-opacity hover:opacity-70"
		>
			<span>{$i18n.profile.history_action}</span>
			<span class="text-subtle font-sans text-[20px]" aria-hidden="true">›</span>
		</button>

		<button
			type="button"
			onclick={() => (logoutOpen = true)}
			class="text-default flex items-center justify-between border-b border-[var(--color-border-soft)] py-[14px] font-sans text-[18px] font-normal transition-opacity hover:opacity-70"
		>
			<span>{$i18n.core.text.sign_out}</span>
			<span class="text-subtle font-sans text-[20px]" aria-hidden="true">›</span>
		</button>
	</nav>
</Sheet>

<AppBottomNav />

<AvatarUploadSheet
	open={avatarSheetOpen}
	busy={avatarUploading}
	onclose={() => (avatarSheetOpen = false)}
	onpicked={onAvatarPicked}
/>

<LogoutConfirmModal open={logoutOpen} onclose={() => (logoutOpen = false)} />
