<script lang="ts">
	import Avatar from '$lib/components/Avatar.svelte';
	import { userPrincipalShort } from '$lib/derived/user.derived';

	interface Props {
		/** Avatar size (mirrors the underlying Avatar component). */
		size?: 'sm' | 'md' | 'lg' | 'xl';
	}

	let { size = 'md' }: Props = $props();
</script>

<!-- Avatar falls back to caller-principal initials when no image is set. -->
<span
	class="text-default-inverse inline-flex items-center gap-[12px] font-sans text-[15px] font-normal underline underline-offset-2"
>
	<span>{$userPrincipalShort}</span>
	<Avatar fallback={$userPrincipalShort} {size} alt={$userPrincipalShort} />
</span>
