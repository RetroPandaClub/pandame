<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone = 'primary' | 'success';

	interface Props {
		title: string;
		/** Sub-line under the title (e.g. "Arbitrator" under "Profile"). */
		subtitle?: string;
		/**
		 * Header tint. `primary` = brand purple (default — used by Home,
		 * History, Transitions, Create Deal, Profile User). `success` =
		 * brand green (used by Profile Arbitrator + Profile Edit).
		 */
		tone?: Tone;
		leading?: Snippet;
		trailing?: Snippet;
		/** Slot below the title row — Figma uses this for the Tabs strip. */
		children?: Snippet;
		ariaLabel?: string;
	}

	let {
		title,
		subtitle,
		tone = 'primary',
		leading,
		trailing,
		children,
		ariaLabel
	}: Props = $props();

	const TONE_BG: Record<Tone, string> = {
		primary: 'bg-primary',
		success: 'bg-success'
	};
</script>

<!--
  Figma BrandHeader spec (`159:1128` Header `166:404`):
    - bg #6200EE (or #1DBB8E for the success tone)
    - top inset 31px from device edge (above safe-area)
    - left/right padding 20px
    - title: Poppins Regular 20px / lh 1 / white
    - subtitle: Poppins Regular ~12px white/80
    - trailing: username (Poppins Regular 15px white underlined)
                + Avatar 48x48
    - optional children (Tabs strip): floats at top=98px in Figma —
      we render it with mt-[18px] which lands at the same y once the
      31px top inset + ~48px for the title row are added.
  Decorative illustration-shadow ellipses behind the row are inlined
  as a CSS radial-gradient so the header reads "lit from inside" on
  desktop without an extra raster asset.
-->
<header
	class="{TONE_BG[
		tone
	]} text-default-inverse relative px-[20px] pt-[max(env(safe-area-inset-top),31px)] pb-[57px]"
	aria-label={ariaLabel ?? title}
>
	<div
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 opacity-40"
		style="background:
				radial-gradient(ellipse 60% 40% at 30% 70%, rgba(255,255,255,0.18), transparent 70%),
				radial-gradient(ellipse 40% 30% at 80% 30%, rgba(255,255,255,0.12), transparent 70%);"
	></div>

	<div class="relative flex items-center justify-between gap-[12px]">
		{#if leading}
			<div class="flex shrink-0 items-center">{@render leading()}</div>
		{/if}

		<div class="flex flex-1 flex-col {leading ? 'items-center text-center' : ''}">
			<h1 class="text-h6 font-sans leading-none font-normal">{title}</h1>
			{#if subtitle}
				<p class="text-figma-12 mt-[2px] font-sans opacity-80">{subtitle}</p>
			{/if}
		</div>

		{#if trailing}
			<div class="flex shrink-0 items-center gap-[12px]">{@render trailing()}</div>
		{/if}
	</div>

	{#if children}
		<div class="relative mt-[18px] flex justify-center">
			{@render children()}
		</div>
	{/if}
</header>
