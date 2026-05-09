<script lang="ts">
	import { goto } from '$app/navigation';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import Button from '$lib/components/Button.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import { userSignedIn } from '$lib/derived/user.derived';
	import { i18n } from '$lib/stores/i18n.store';

	let username = $state('');
	let name = $state('');
	let surname = $state('');
	let address = $state('');
	let email = $state('');

	$effect(() => {
		if (!$userSignedIn) {
			goto('/');
		}
	});

	const cancel = () => goto('/profile');
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

<section class="flex flex-1 flex-col gap-4 px-6 pt-6 pb-28">
	<p
		class="border-warning/40 bg-warning/10 text-body2 text-default rounded-md border p-3"
		role="note"
	>
		{$i18n.profile.edit_disabled_hint}
	</p>

	<FormField label={$i18n.profile.username_label} htmlFor="profile-username">
		<TextInput id="profile-username" bind:value={username} disabled />
	</FormField>

	<div class="grid grid-cols-2 gap-3">
		<FormField label={$i18n.profile.name_label} htmlFor="profile-name">
			<TextInput id="profile-name" bind:value={name} disabled />
		</FormField>

		<FormField label={$i18n.profile.surname_label} htmlFor="profile-surname">
			<TextInput id="profile-surname" bind:value={surname} disabled />
		</FormField>
	</div>

	<FormField label={$i18n.profile.address_label} htmlFor="profile-address">
		<TextInput id="profile-address" bind:value={address} disabled />
	</FormField>

	<FormField label={$i18n.profile.email_label} htmlFor="profile-email">
		<TextInput id="profile-email" type="email" bind:value={email} disabled />
	</FormField>

	<div class="mt-auto flex gap-3">
		<Button variant="ghost" fullWidth onclick={cancel}>{$i18n.profile.edit_cancel}</Button>
		<Button fullWidth disabled>{$i18n.profile.edit_save}</Button>
	</div>
</section>

<AppBottomNav />
