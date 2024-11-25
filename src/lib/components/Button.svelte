<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		disabled?: boolean | undefined;
		children: Snippet;
		onclick: () => Promise<void>;
	}

	let { disabled = undefined, children, onclick }: Props = $props();
</script>

<button
	{onclick}
	{disabled}
	class={`my-2 flex items-center gap-2 rounded-sm border-[3px] border-black bg-lavender-blue-500 px-8 py-1 font-semibold text-white shadow-[5px_5px_0px_rgba(0,0,0,1)] transition-all dark:border-lavender-blue-500 dark:bg-black dark:shadow-[5px_5px_0px_#7888ff] ${disabled === true ? 'opacity-25' : 'hover:bg-lavender-blue-600 active:translate-x-[5px] active:translate-y-[5px] active:bg-lavender-blue-400 active:shadow-none dark:hover:bg-lavender-blue-300 dark:hover:text-black dark:active:bg-lavender-blue-500'}`}
>
	{@render children()}
</button>
