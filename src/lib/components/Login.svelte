<script lang="ts">
	import { signIn } from '@junobuild/core';
	import Button from '$lib/components/Button.svelte';

	const login = async () => {
		await signIn({ internet_identity: {} });
	};
</script>

<Button onclick={login}>Sign in</Button>
