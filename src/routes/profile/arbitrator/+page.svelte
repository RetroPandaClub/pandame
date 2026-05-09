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
	<title>{$i18n.profile.role_arbitrator} · {$i18n.layout.title}</title>
</svelte:head>

<RoleStubScreen
	role="arbitrator"
	title={$i18n.profile.role_arbitrator_title}
	description={$i18n.profile.role_arbitrator_description}
/>
