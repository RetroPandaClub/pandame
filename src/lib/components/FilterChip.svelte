<script lang="ts">
	import FilterIcon from '$lib/components/icons/FilterIcon.svelte';

	interface Props {
		label: string;
		onclick?: () => void;
		ariaLabel?: string;
		ariaExpanded?: boolean;
	}

	let { label, onclick = () => {}, ariaLabel, ariaExpanded }: Props = $props();
</script>

<button
	type="button"
	{onclick}
	aria-label={ariaLabel ?? label}
	aria-expanded={ariaExpanded}
	class="text-default-inverse inline-flex h-[36px] items-center gap-[10px] rounded-[55px] border border-[rgba(133,88,237,0.67)] bg-transparent px-[18px] font-sans text-[16px] leading-[24px] font-normal transition-opacity hover:opacity-80"
>
	<span>{label}</span>
	<span class="flex h-[13px] w-[15px] items-center">
		<FilterIcon />
	</span>
</button>
