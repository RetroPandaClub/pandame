<script lang="ts">
	import { signIn } from '@junobuild/core';
	import Button from '$lib/components/Button.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		fullWidth?: boolean;
		size?: 'sm' | 'md' | 'lg';
		/**
		 * Override the default `Sign in` label — e.g. the welcome screen
		 * uses `Connect` since the user hasn't yet been told what
		 * Internet Identity is.
		 */
		label?: string;
	}

	let { fullWidth = false, size = 'md', label }: Props = $props();

	let progress = $state(false);

	let resolvedLabel = $derived(label ?? $i18n.core.text.sign_in);

	const login = async () => {
		progress = true;
		try {
			await signIn({ internet_identity: {} });
		} catch (err) {
			console.error('Sign-in failed:', err);
		} finally {
			progress = false;
		}
	};
</script>

<Button onclick={login} loading={progress} {fullWidth} {size}>
	{resolvedLabel}
</Button>
