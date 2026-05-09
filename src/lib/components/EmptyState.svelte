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
	class="dark:border-lavender-blue-500/40 my-8 flex flex-col items-center gap-3 rounded border-[3px] border-dashed border-black/30 p-8 text-center dark:text-white"
>
	<h3 class="text-lg font-semibold">{title}</h3>
	{#if description !== undefined}
		<p class="max-w-md text-sm opacity-75">{description}</p>
	{/if}
	{#if children}
		<div class="mt-2">
			{@render children()}
		</div>
	{/if}
</section>
