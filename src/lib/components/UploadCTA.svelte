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
  Figma `311:8232` "Choose files to upload" + caption pair:
    - Purple button (`xs` size = 31 × full-width, rounded-[9px],
      Poppins Medium 11.4 px white, bg #6200EE — i.e. `bg-primary`,
      not the slightly darker `primary-stroke` other CTAs use).
    - Caption underneath: Poppins Medium 10.26 px lh 1.49 light
      purple `--color-primary-light`, centered.
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
