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
    - Bot:   60–76 px lavender bot avatar on the LEFT, `gap-[12px]`,
             then a speech bubble on a soft surface with a 6 px
             rounded-bl tail.
    - User:  no avatar; right-aligned bubble on the brand purple
             with a 6 px rounded-br tail. The user mostly replies
             via `<ChatChoiceRow>`, so this side is rare.
-->
<div
	class="flex w-full items-end gap-[12px] {side === 'bot'
		? 'justify-start'
		: 'flex-row-reverse justify-start'}"
	role={ariaLabel !== undefined ? 'group' : undefined}
	aria-label={ariaLabel}
>
	{#if side === 'bot'}
		<PandaBotAvatar size="md" />
	{/if}

	<div
		class="text-default max-w-[70%] rounded-[20px] px-[18px] py-[12px] font-sans text-[14px] leading-[1.4] {side ===
		'bot'
			? 'bg-bg-soft rounded-bl-[6px]'
			: 'bg-primary text-default-inverse rounded-br-[6px]'}"
	>
		{@render children()}
	</div>
</div>
