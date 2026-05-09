<script lang="ts">
	import { signIn } from '@junobuild/core';
	import Button from '$lib/components/Button.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	const login = async () => {
		await signIn({ internet_identity: {} });
	};
</script>

<Button onclick={login}>{$i18n.core.text.sign_in}</Button>
