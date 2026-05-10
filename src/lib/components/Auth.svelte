<script lang="ts">
	import { onAuthStateChange } from '@junobuild/core';
	import { onDestroy, onMount } from 'svelte';
	import { browser, dev } from '$app/environment';
	import { userStore } from '$lib/stores/user.store';

	let unsubscribe: (() => void) | undefined = undefined;

	// Skip the real auth subscription when the dev-only bypass is active
	// (`?dev=1` in `vite dev`). Otherwise Juno's `onAuthStateChange`
	// fires with `null` shortly after page load and clobbers the mock
	// user that `DevAuth.svelte` injected, so the auth-guarded routes
	// would still bounce back to `/`.
	const isDevBypass = (): boolean => {
		if (!dev || !browser) {
			return false;
		}

		return new URLSearchParams(window.location.search).has('dev');
	};

	onMount(() => {
		if (isDevBypass()) {
			return;
		}

		unsubscribe = onAuthStateChange((user) => userStore.set(user));
	});

	const automaticSignOut = () => console.warn('Automatically signed out because session expired');

	onDestroy(() => unsubscribe?.());
</script>

<svelte:window onjunoSignOutAuthTimer={automaticSignOut} />
