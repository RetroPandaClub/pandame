<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { goto } from '$app/navigation';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import Button from '$lib/components/Button.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import { userSignedIn } from '$lib/derived/user.derived';
	import { ensureProfile, upsertProfile } from '$lib/services/profile.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { profileStore } from '$lib/stores/profile.store';
	import { userStore } from '$lib/stores/user.store';
	import { emptyProfile, type UserProfile } from '$lib/types/profile';

	let principalText = $derived($userStore?.key);

	let username = $state('');
	let name = $state('');
	let surname = $state('');
	let address = $state('');
	let email = $state('');

	let loading = $state(true);
	let saving = $state(false);
	let saveError: string | undefined = $state(undefined);
	let saveSuccess = $state(false);

	$effect(() => {
		if (!$userSignedIn) {
			goto('/');
		}
	});

	$effect(() => {
		const text = principalText;

		if (text === undefined || text.length === 0) {
			loading = false;

			return;
		}

		loading = true;

		(async () => {
			try {
				const doc = await ensureProfile(text);
				profileStore.set(doc);
				hydrateForm(doc.data);
			} catch (err) {
				console.error('Failed to load profile for editing:', err);
			} finally {
				loading = false;
			}
		})();
	});

	const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	let emailValid = $derived(email.length === 0 || EMAIL_RE.test(email));
	let valid = $derived(emailValid);

	const submit = async () => {
		const text = principalText;

		if (text === undefined || !valid) {
			return;
		}

		const doc = $profileStore ?? { key: text, data: emptyProfile(text) };

		saving = true;
		saveError = undefined;
		saveSuccess = false;

		try {
			const updated = await upsertProfile({
				...doc,
				data: {
					owner: text,
					username: username.trim(),
					name: name.trim(),
					surname: surname.trim(),
					address: address.trim(),
					email: email.trim()
				}
			});

			profileStore.set(updated);
			saveSuccess = true;
			setTimeout(() => goto('/profile'), 800);
		} catch (err) {
			saveError = err instanceof Error ? err.message : String(err);
			console.error('upsertProfile failed:', err);
		} finally {
			saving = false;
		}
	};

	const cancel = () => goto('/profile');

	function hydrateForm(data: UserProfile) {
		username = data.username;
		name = data.name;
		surname = data.surname;
		address = data.address;
		email = data.email;
	}
</script>

<svelte:head>
	<title>{$i18n.profile.edit_title} · {$i18n.layout.title}</title>
</svelte:head>

<BrandHeader title={$i18n.profile.edit_title}>
	{#snippet leading()}
		<IconButton ariaLabel={$i18n.profile.edit_cancel} variant="ghost" onclick={cancel}>
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

<form
	class="flex flex-1 flex-col gap-4 px-6 pt-6 pb-28"
	onsubmit={(e) => {
		e.preventDefault();
		submit();
	}}
>
	{#if loading}
		<p class="text-body2 text-muted" aria-live="polite">{$i18n.profile.loading}</p>
	{:else}
		<FormField label={$i18n.profile.username_label} htmlFor="profile-username">
			<TextInput
				id="profile-username"
				bind:value={username}
				placeholder={$i18n.profile.username_placeholder}
				disabled={saving}
			/>
		</FormField>

		<div class="grid grid-cols-2 gap-3">
			<FormField label={$i18n.profile.name_label} htmlFor="profile-name">
				<TextInput
					id="profile-name"
					bind:value={name}
					placeholder={$i18n.profile.name_placeholder}
					disabled={saving}
				/>
			</FormField>

			<FormField label={$i18n.profile.surname_label} htmlFor="profile-surname">
				<TextInput
					id="profile-surname"
					bind:value={surname}
					placeholder={$i18n.profile.surname_placeholder}
					disabled={saving}
				/>
			</FormField>
		</div>

		<FormField label={$i18n.profile.address_label} htmlFor="profile-address">
			<TextInput
				id="profile-address"
				bind:value={address}
				placeholder={$i18n.profile.address_placeholder}
				disabled={saving}
			/>
		</FormField>

		<FormField
			label={$i18n.profile.email_label}
			htmlFor="profile-email"
			error={!emailValid ? $i18n.profile.email_invalid : undefined}
		>
			<TextInput
				id="profile-email"
				type="email"
				inputmode="email"
				bind:value={email}
				placeholder={$i18n.profile.email_placeholder}
				disabled={saving}
				invalid={!emailValid}
			/>
		</FormField>

		{#if saveError !== undefined}
			<p
				class="border-danger bg-danger/10 text-body2 text-danger rounded-md border p-3"
				role="alert"
			>
				{nonNullish(saveError) ? $i18n.profile.edit_save_error : ''}
				<span class="text-xxs block opacity-75">{saveError}</span>
			</p>
		{:else if saveSuccess}
			<p
				class="border-success bg-success/10 text-body2 text-success rounded-md border p-3"
				role="status"
			>
				{$i18n.profile.edit_save_success}
			</p>
		{/if}

		<div class="mt-auto flex gap-3">
			<Button type="button" variant="ghost" fullWidth disabled={saving} onclick={cancel}>
				{$i18n.profile.edit_cancel}
			</Button>
			<Button type="submit" fullWidth disabled={!valid} loading={saving}>
				{saving ? $i18n.profile.edit_saving : $i18n.profile.edit_save}
			</Button>
		</div>
	{/if}
</form>

<AppBottomNav />
