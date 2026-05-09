<script lang="ts">
	import { goto } from '$app/navigation';
	import RoleStubScreen from '$lib/components/RoleStubScreen.svelte';
	import { userSignedIn } from '$lib/derived/user.derived';
	import { i18n } from '$lib/stores/i18n.store';

	$effect(() => {
		if (!$userSignedIn) {
			goto('/');
		}
	});
</script>

<svelte:head>
	<title>{$i18n.profile.role_admin} · {$i18n.layout.title}</title>
</svelte:head>

<RoleStubScreen
	role="admin"
	title={$i18n.profile.role_admin_title}
	description={$i18n.profile.role_admin_description}
/>
