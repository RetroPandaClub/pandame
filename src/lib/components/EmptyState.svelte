<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		children?: Snippet;
	}

	let { title, description, children }: Props = $props();
</script>

<section
	class="border-border-soft text-default my-8 flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 text-center"
>
	<h3 class="text-h6 font-bold">{title}</h3>
	{#if description !== undefined}
		<p class="text-muted text-body2 max-w-md">{description}</p>
	{/if}
	{#if children}
		<div class="mt-2">
			{@render children()}
		</div>
	{/if}
</section>
