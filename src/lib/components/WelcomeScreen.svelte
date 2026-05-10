<script lang="ts">
	import Login from '$lib/components/Login.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<!--
  Welcome screen is a single-viewport experience: pinned to the
  device frame's height, never scrolls. Three rows stack with the
  artwork claiming `flex-1` so it absorbs all the slack on tall
  phones (centred via `justify-center`) and shrinks gracefully on
  small phones via `min-h-0`. The blur underlay bleeds in from
  below as decoration only.
-->
<section
	class="bg-bg relative flex h-[100dvh] w-full flex-col items-center overflow-hidden pt-[max(env(safe-area-inset-top),42px)] pb-[max(env(safe-area-inset-bottom),24px)]"
>
	<img
		src="/brand/welcome-blur.svg"
		alt=""
		aria-hidden="true"
		class="pointer-events-none absolute -bottom-32 left-1/2 w-[200%] max-w-none -translate-x-1/2"
	/>

	<header class="relative w-full px-6 pt-[40px]">
		<h1 class="text-default text-h5 text-center font-semibold">
			{$i18n.welcome.greeting_prefix}<span class="font-bold">{$i18n.layout.title}</span>{$i18n
				.welcome.greeting_suffix}
		</h1>
	</header>

	<div
		class="relative flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-[32px] px-6"
	>
		<!--
      Logo animation: animated dashed rings + scattered particles
      layered behind the panda silhouette. Both assets are larger
      than their viewport and intentionally crop on every side so
      the rings appear to extend off-frame. The artwork scales with
      the available slack — `min-h-0` lets it shrink on short
      phones rather than overflowing the section.
    -->
		<div class="relative aspect-[345/317] min-h-0 w-full max-w-[345px] flex-shrink overflow-hidden">
			<img
				src="/brand/welcome-rings.gif"
				alt=""
				aria-hidden="true"
				class="absolute top-[-22.7%] left-[-13.9%] h-[135.6%] w-[124.6%] max-w-none"
			/>
			<img
				src="/brand/panda.png"
				alt=""
				aria-hidden="true"
				class="absolute top-[-29.3%] left-[-18.6%] h-[137.2%] w-[126.4%] max-w-none"
			/>
		</div>

		<p class="text-default text-h6 text-center font-normal">
			{$i18n.welcome.cta_caption}
		</p>
	</div>

	<footer class="relative w-full px-[40px] pt-4">
		<Login fullWidth label={$i18n.welcome.cta_button} />
	</footer>
</section>
