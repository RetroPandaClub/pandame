<script lang="ts">
	import ChevronDownIcon from '$lib/components/icons/ChevronDownIcon.svelte';
	import FilterIcon from '$lib/components/icons/FilterIcon.svelte';

	interface Props {
		label: string;
		onclick?: () => void;
		ariaLabel?: string;
		ariaExpanded?: boolean;
	}

	let { label, onclick = () => {}, ariaLabel, ariaExpanded }: Props = $props();
</script>

<!--
  Single dropdown-style filter chip: ~134 × 38 px white pill
  (`rounded-xl` 20 px, 1.5 px light-purple border). Label is 14 px
  Poppins Medium Blu Night, with a small funnel icon + chevron-down
  on the right. `aria-expanded` lets a future menu wire its state in.
-->
<button
	type="button"
	{onclick}
	aria-label={ariaLabel ?? label}
	aria-expanded={ariaExpanded}
	class="bg-bg-elevated border-border text-default hover:border-primary-stroke inline-flex h-[38px] items-center gap-[10px] rounded-xl border-[1.5px] px-[18px] font-sans text-[14px] font-medium transition-colors"
>
	<span>{label}</span>
	<span class="text-default flex h-[14px] w-[14px] items-center">
		<FilterIcon />
	</span>
	<span class="text-default flex h-[10px] w-[10px] items-center">
		<ChevronDownIcon />
	</span>
</button>
