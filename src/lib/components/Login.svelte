<script lang="ts">
	import { signIn } from '@junobuild/core-peer';
	import Button from '$lib/components/Button.svelte';

	const login = async () => {
		await signIn();
	};
</script>

<Button onclick={login}>Sign in</Button>
