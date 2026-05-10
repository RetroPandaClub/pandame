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
		/** Slot below the title row — typically a Tabs / FilterChip strip. */
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
  Full-bleed coloured header:
    - tone="primary" (purple) by default; tone="success" (green) on
      the Profile screens
    - 31 px top inset above the iOS safe-area, 20 px horizontal
      padding, ~57 px bottom padding so the Sheet's 40 px overlap
      leaves a visible band of header behind the rounded corners
    - title: Poppins Regular 20 px white
    - optional subtitle (small Poppins Regular 12 px white/80)
    - trailing: username + 48 px Avatar
    - optional children (Tabs / FilterChip strip) sit `mt-[18px]`
      below the title row
  Two decorative blurred ellipses are layered behind the row as a
  CSS radial-gradient so the header reads "lit from inside" without
  an extra raster asset.
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
				<p class="mt-[3px] font-sans text-[10px] font-extralight tracking-[0.4px]">
					{subtitle}
				</p>
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
