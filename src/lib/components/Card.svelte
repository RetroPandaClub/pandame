<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		title?: string;
		footer?: Snippet;
	}

	let { children, title, footer }: Props = $props();
</script>

<article
	class="dark:border-lavender-blue-500 rounded border-[3px] border-black bg-white p-4 shadow-[5px_5px_0px_rgba(0,0,0,1)] dark:bg-black dark:text-white dark:shadow-[5px_5px_0px_#7888FF]"
>
	{#if title !== undefined}
		<header class="mb-2 text-lg font-semibold">{title}</header>
	{/if}

	<div class="space-y-2">
		{@render children()}
	</div>

	{#if footer}
		<footer class="mt-4 flex items-center justify-end gap-2">
			{@render footer()}
		</footer>
	{/if}
</article>
