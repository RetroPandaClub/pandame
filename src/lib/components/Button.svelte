<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		disabled?: boolean | undefined;
		children: Snippet;
		onclick: () => void | Promise<void>;
	}

	let { disabled = undefined, children, onclick }: Props = $props();
</script>

<button
	{onclick}
	{disabled}
	class={`bg-primary dark:border-primary my-2 flex items-center gap-2 rounded-sm border-[3px] border-black px-8 py-1 font-semibold text-white shadow-[5px_5px_0px_rgba(0,0,0,1)] transition-all dark:bg-black dark:shadow-[5px_5px_0px_#632AE8] ${disabled === true ? 'opacity-25' : 'hover:bg-primary/90 active:bg-primary/80 dark:hover:bg-primary-light dark:active:bg-primary active:translate-x-[5px] active:translate-y-[5px] active:shadow-none dark:hover:text-black'}`}
>
	{@render children()}
</button>
