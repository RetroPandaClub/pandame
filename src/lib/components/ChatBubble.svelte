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
  Figma chat row (`159:1207` / `159:1246`):
    - Bot:   60-76 px lavender avatar on the LEFT, gap-[12px], speech
             bubble on the right, bg #ECECF6 (light surface), rounded
             with a top-left "tail" (we use plain rounded-[20px]).
    - User:  no avatar; right-aligned bubble bg-primary text-white
             outlined pill (rare in Figma — the user mostly replies
             via ChatChoiceRow).
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
