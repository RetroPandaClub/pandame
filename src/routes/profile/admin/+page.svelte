<script lang="ts">
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import RoleStubScreen from '$lib/components/RoleStubScreen.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<svelte:head>
	<title>{$i18n.profile.role_admin} · {$i18n.layout.title}</title>
</svelte:head>

<AuthGuard />

<RoleStubScreen
	role="admin"
	title={$i18n.profile.role_admin_title}
	description={$i18n.profile.role_admin_description}
/>
