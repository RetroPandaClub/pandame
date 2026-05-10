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
  The bubble's flat corner (bl on bot, br on user) tucks into the
  side that owns the avatar — that's why the radius is 0 there.
  The user variant is rare: most user replies go through
  `<ChatChoiceRow>` instead of a bubble.
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
		class="text-link-purple shadow-bubble font-sans text-[16px] leading-[1.4] font-light {side ===
		'bot'
			? 'bg-bubble-bot rounded-tl-[50px] rounded-tr-[26px] rounded-br-[26px] rounded-bl-none pt-[20px] pr-[12px] pb-[14px] pl-[32px]'
			: 'text-default-inverse bg-primary rounded-tl-[26px] rounded-tr-[50px] rounded-br-none rounded-bl-[26px] pt-[20px] pr-[32px] pb-[14px] pl-[12px]'} max-w-[78%]"
	>
		{@render children()}
	</div>
</div>
