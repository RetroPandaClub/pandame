<script lang="ts">
	interface Props {
		spinner?: boolean;
	}

	let { spinner = false }: Props = $props();
</script>

<div
	class:backdrop-blur-sm={spinner}
	class:backdrop-blur-xl={!spinner}
	class="fixed inset-0 z-40 flex items-center justify-center bg-white/30"
>
	{#if spinner}
		<div
			class="h-12 w-12 animate-spin rounded-full border-[3px] border-solid border-lavender-blue-600 border-t-transparent"
		></div>
	{/if}
</div>
