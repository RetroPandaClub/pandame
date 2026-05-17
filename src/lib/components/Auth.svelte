<script lang="ts">
	import { onAuthStateChange } from '@junobuild/core';
	import { onDestroy, onMount } from 'svelte';
	import { browser, dev } from '$app/environment';
	import { userPrincipalText } from '$lib/derived/user.derived';
	import { ensureProfile } from '$lib/services/profile.services';
	import { profileStore } from '$lib/stores/profile.store';
	import { userStore } from '$lib/stores/user.store';

	let unsubscribe: (() => void) | undefined = undefined;

	// Skip the real subscription under `?dev=1` — Juno would otherwise
	// fire with `null` and clobber the mock user `DevAuth` injected.
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

	// One central `ensureProfile` so badges in shared chrome can render
	// the avatar without every page re-issuing the call.
	$effect(() => {
		const text = $userPrincipalText;
		if (text === undefined || text.length === 0) {
			profileStore.reset();
			return;
		}
		(async () => {
			try {
				const doc = await ensureProfile(text);
				profileStore.set(doc);
			} catch (err) {
				console.error('Failed to bootstrap profile after sign-in:', err);
			}
		})();
	});

	onDestroy(() => unsubscribe?.());
</script>

<svelte:window onjunoSignOutAuthTimer={automaticSignOut} />
