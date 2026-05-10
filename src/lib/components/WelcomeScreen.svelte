<script lang="ts">
	import Login from '$lib/components/Login.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<!--
  Single-viewport screen — `h-[100dvh] overflow-hidden` so it never
  scrolls. The middle row owns `flex-1 min-h-0` so the artwork
  absorbs slack on tall phones and shrinks rather than overflowing
  on short ones.
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
      Both layers are deliberately larger than their viewport and
      crop on every side so the dashed rings extend off-frame.
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
