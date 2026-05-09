<script lang="ts">
	import { onAuthStateChange } from '@junobuild/core';
	import { onDestroy, onMount } from 'svelte';
	import { userStore } from '$lib/stores/user.store';

	let unsubscribe: (() => void) | undefined = undefined;

	onMount(() => (unsubscribe = onAuthStateChange((user) => userStore.set(user))));

	const automaticSignOut = () => console.warn('Automatically signed out because session expired');

	onDestroy(() => unsubscribe?.());
</script>

<svelte:window onjunoSignOutAuthTimer={automaticSignOut} />
