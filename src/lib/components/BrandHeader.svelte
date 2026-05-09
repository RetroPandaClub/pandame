<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		subtitle?: string;
		leading?: Snippet;
		trailing?: Snippet;
		children?: Snippet;
		ariaLabel?: string;
	}

	let { title, subtitle, leading, trailing, children, ariaLabel }: Props = $props();
</script>

<header
	class="bg-primary pt-[max(env(safe-area-inset-top),1rem)] pb-6 text-white"
	aria-label={ariaLabel ?? title}
>
	<div class="flex items-center justify-between gap-3 px-6">
		{#if leading}
			<div class="flex items-center">{@render leading()}</div>
		{/if}

		<div class="flex flex-1 flex-col {leading ? 'items-center text-center' : ''}">
			<h1 class="text-h5 leading-tight font-bold">{title}</h1>
			{#if subtitle}
				<p class="text-body2 opacity-80">{subtitle}</p>
			{/if}
		</div>

		{#if trailing}
			<div class="flex items-center gap-2">{@render trailing()}</div>
		{/if}
	</div>

	{#if children}
		<div class="mt-4 flex justify-center px-6">
			{@render children()}
		</div>
	{/if}
</header>
