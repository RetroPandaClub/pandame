<script lang="ts">
	import { onAuthStateChange } from '@junobuild/core';
	import { onDestroy, onMount } from 'svelte';
	import { browser, dev } from '$app/environment';
	import { userPrincipalText } from '$lib/derived/user.derived';
	import { ensureProfile } from '$lib/services/profile.services';
	import { profileStore } from '$lib/stores/profile.store';
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

	// Centralised profile bootstrap: keep `profileStore` in sync with the
	// signed-in principal so any component (e.g. `UserPrincipalBadge` in
	// the BrandHeader trailing slot) can render the user's avatar without
	// each page having to re-issue `ensureProfile`. Pages that need a
	// guaranteed-fresh profile (Profile, Profile Edit) still call
	// `ensureProfile` themselves — those calls are idempotent.
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
