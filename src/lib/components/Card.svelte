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
	class="bg-bg text-default border-border-soft shadow-primary/5 rounded-lg border p-4 shadow-md"
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
