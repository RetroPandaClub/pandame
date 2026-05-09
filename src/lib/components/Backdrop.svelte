<script lang="ts">
	interface Props {
		spinner?: boolean;
	}

	let { spinner = false }: Props = $props();
</script>

<div
	class:backdrop-blur-sm={spinner}
	class:backdrop-blur-xl={!spinner}
	class="bg-default/30 fixed inset-0 z-40 flex items-center justify-center"
>
	{#if spinner}
		<div
			class="border-primary h-12 w-12 animate-spin rounded-full border-[3px] border-solid border-t-transparent"
		></div>
	{/if}
</div>
