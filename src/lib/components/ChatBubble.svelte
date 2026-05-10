<script lang="ts">
	import type { Snippet } from 'svelte';
	import PandaBotAvatar from '$lib/components/PandaBotAvatar.svelte';

	type Side = 'bot' | 'user';

	interface Props {
		side?: Side;
		children: Snippet;
		ariaLabel?: string;
	}

	let { side = 'bot', children, ariaLabel }: Props = $props();
</script>

<!--
  Chat row:
    - Bot:   70 px lavender bot avatar on the LEFT, `gap-[18px]`,
             then a soft-grey speech bubble whose corners are cut
             into the canonical "blob": tl-50, tr-26, br-26, bl-0
             so the flat edge tucks into the avatar. Body copy is
             16 px Poppins Light Link-Purple.
    - User:  no avatar; right-aligned bubble on the brand purple
             with mirrored "blob" corners. The user mostly replies
             via `<ChatChoiceRow>`, so this side is rare.
-->
<div
	class="flex w-full items-end gap-[18px] {side === 'bot'
		? 'justify-start'
		: 'flex-row-reverse justify-start'}"
	role={ariaLabel !== undefined ? 'group' : undefined}
	aria-label={ariaLabel}
>
	{#if side === 'bot'}
		<PandaBotAvatar size="md" />
	{/if}

	<div
		class="text-link-purple font-sans text-[16px] leading-[1.4] font-light {side === 'bot'
			? 'rounded-tl-[50px] rounded-tr-[26px] rounded-br-[26px] rounded-bl-none bg-[#ececec] pt-[20px] pr-[12px] pb-[14px] pl-[32px] shadow-[0_4px_2px_rgba(0,0,0,0.25)]'
			: 'text-default-inverse bg-primary rounded-tl-[26px] rounded-tr-[50px] rounded-br-none rounded-bl-[26px] pt-[20px] pr-[32px] pb-[14px] pl-[12px] shadow-[0_4px_2px_rgba(0,0,0,0.25)]'} max-w-[78%]"
	>
		{@render children()}
	</div>
</div>
