<script lang="ts">
	import Avatar from '$lib/components/Avatar.svelte';
	import { userPrincipalShort } from '$lib/derived/user.derived';

	interface Props {
		/** Avatar size (mirrors the underlying Avatar component). */
		size?: 'sm' | 'md' | 'lg';
	}

	let { size = 'md' }: Props = $props();
</script>

<span class="text-default-inverse text-body2 inline-flex items-center gap-2 font-bold">
	<span>{$userPrincipalShort}</span>
	<Avatar fallback={$userPrincipalShort} {size} alt={$userPrincipalShort} />
</span>
