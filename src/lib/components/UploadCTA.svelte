<script lang="ts">
	interface Props {
		label: string;
		caption: string;
		onclick?: () => void;
		ariaLabel?: string;
	}

	let { label, caption, onclick = () => {}, ariaLabel }: Props = $props();
</script>

<!--
  Purple full-width button (31 × any, `rounded-[9px]`, Poppins
  Medium 11.4 px white) plus a small caption underneath (Poppins
  Medium ~10 px / lh 1.49 in `primary-light`). The button uses the
  lighter `bg-primary` (`#6200EE`) — not `primary-stroke` like the
  other CTAs — so the upload affordance reads as secondary chrome.
-->
<div class="flex flex-col items-stretch gap-[2.28px]">
	<button
		type="button"
		{onclick}
		aria-label={ariaLabel ?? label}
		class="bg-primary text-default-inverse flex h-[31px] items-center justify-center rounded-[9px] font-sans text-[11.4px] font-medium transition-colors hover:opacity-90"
	>
		{label}
	</button>
	<p class="text-primary-light text-center text-[10.26px] leading-[1.49] font-medium">
		{caption}
	</p>
</div>
