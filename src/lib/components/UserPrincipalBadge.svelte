<script lang="ts">
	import Avatar from '$lib/components/Avatar.svelte';
	import { userPrincipalShort } from '$lib/derived/user.derived';

	interface Props {
		/** Avatar size (mirrors the underlying Avatar component). */
		size?: 'sm' | 'md' | 'lg' | 'xl';
	}

	let { size = 'md' }: Props = $props();
</script>

<!--
  Figma trailing slot (`159:1128 / 166:401`):
    - Username: Poppins Regular 15px white underlined
    - Avatar: 48 x 48 (NFT-style image, fall back to initials)
    - gap 12px between them
-->
<span
	class="text-default-inverse text-figma-15 inline-flex items-center gap-[12px] font-sans font-normal underline underline-offset-2"
>
	<span>{$userPrincipalShort}</span>
	<Avatar fallback={$userPrincipalShort} {size} alt={$userPrincipalShort} />
</span>
