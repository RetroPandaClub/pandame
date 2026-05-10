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

<!--
  Single dropdown-style filter chip: a transparent capsule outlined
  in `rgba(133,88,237,0.67)` (the Figma "shape-primary" stroke)
  with white 16 px Poppins Regular copy at 24 px line-height — same
  visual family as the home greeting pill, so it reads as a quiet
  badge layered on the purple BrandHeader. Trailing funnel icon is
  10 × 13 px and inherits text colour. `aria-expanded` lets a
  future menu wire its state in.
-->
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
