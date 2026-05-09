<script lang="ts">
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import RoleStubScreen from '$lib/components/RoleStubScreen.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<svelte:head>
	<title>{$i18n.profile.role_arbitrator} · {$i18n.layout.title}</title>
</svelte:head>

<AuthGuard />

<RoleStubScreen
	role="arbitrator"
	title={$i18n.profile.role_arbitrator_title}
	description={$i18n.profile.role_arbitrator_description}
/>
