<script lang="ts">
	import Login from '$lib/components/Login.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<section class="bg-bg relative flex min-h-[100dvh] w-full flex-col items-center overflow-hidden">
	<!--
    Decorative ambient blur underlay — bleeds in from below. Positioned
    absolutely so it doesn't affect the column flow; `pointer-events-none`
    so it never blocks the CTA.
  -->
	<img
		src="/brand/welcome-blur.svg"
		alt=""
		aria-hidden="true"
		class="pointer-events-none absolute -bottom-32 left-1/2 w-[200%] max-w-none -translate-x-1/2"
	/>

	<div
		class="relative flex w-full flex-1 flex-col items-center pt-[max(env(safe-area-inset-top),42px)]"
	>
		<div class="flex w-full flex-col items-center gap-[56px] px-6 pt-[60px]">
			<h1 class="text-default text-h5 text-center font-semibold">
				{$i18n.welcome.greeting_prefix}<span class="font-bold">{$i18n.layout.title}</span>{$i18n
					.welcome.greeting_suffix}
			</h1>

			<div class="flex w-full flex-col items-center gap-[40px]">
				<!--
          Logo animation: animated dashed rings + scattered particles
          layered behind the panda silhouette. Both assets are larger
          than their viewport and intentionally crop on every side so
          the rings appear to extend off-frame. Sizes are
          percentage-based so the artwork scales cleanly from a 320 px
          phone up to the 420 px device-frame max-width without
          breaking the crop ratios.
        -->
				<div class="relative aspect-[345/317] w-full max-w-[345px] overflow-hidden">
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
		</div>

		<div class="mt-auto w-full px-[40px] pt-10 pb-[max(env(safe-area-inset-bottom),24px)]">
			<Login fullWidth label={$i18n.welcome.cta_button} />
		</div>
	</div>
</section>
