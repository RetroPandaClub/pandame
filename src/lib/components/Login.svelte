<script lang="ts">
	import { signIn } from '@junobuild/core';
	import Button from '$lib/components/Button.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		fullWidth?: boolean;
		size?: 'sm' | 'md' | 'lg';
	}

	let { fullWidth = false, size = 'md' }: Props = $props();

	let progress = $state(false);

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
	{$i18n.core.text.sign_in}
</Button>
