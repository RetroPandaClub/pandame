<script lang="ts">
	import InfoIcon from '$lib/components/icons/InfoIcon.svelte';

	interface Props {
		label: string;
		href?: string;
		onclick?: () => void;
		ariaLabel?: string;
	}

	let { label, href, onclick, ariaLabel }: Props = $props();
</script>

<!--
  Figma `159:1194` "Help?":
    - 24 × 24 info icon + Poppins Light 15 px / lh 1.49 #6B36E8 link
    - gap-[6px] between icon and text
-->
{#if href !== undefined}
	<a
		{href}
		aria-label={ariaLabel ?? label}
		class="text-link-purple inline-flex items-end gap-[6px] font-sans text-[15px] leading-[1.49] font-light hover:underline"
		target="_blank"
		rel="noopener noreferrer"
	>
		<span class="flex h-[24px] w-[24px] items-center justify-center">
			<InfoIcon />
		</span>
		<span>{label}</span>
	</a>
{:else}
	<button
		type="button"
		{onclick}
		aria-label={ariaLabel ?? label}
		class="text-link-purple inline-flex items-end gap-[6px] font-sans text-[15px] leading-[1.49] font-light hover:underline"
	>
		<span class="flex h-[24px] w-[24px] items-center justify-center">
			<InfoIcon />
		</span>
		<span>{label}</span>
	</button>
{/if}
