<script lang="ts">
	import { onMount } from 'svelte';
	import { browser, dev } from '$app/environment';
	import { userPrincipalText } from '$lib/derived/user.derived';
	import { initAuth, watchAuth } from '$lib/services/auth.services';
	import { ensureProfile } from '$lib/services/profile.services';
	import { profileStore } from '$lib/stores/profile.store';

	// Skip the session restore under `?dev=1` — it would resolve to "signed
	// out" and clobber the mock user `DevAuth` injected.
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

		initAuth();

		return watchAuth();
	});

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
				const profile = await ensureProfile(text);
				profileStore.set(profile);
			} catch (err) {
				console.error('Failed to bootstrap profile after sign-in:', err);
			}
		})();
	});
</script>
