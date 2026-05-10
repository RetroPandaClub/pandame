<script lang="ts">
	import Login from '$lib/components/Login.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<section class="relative flex min-h-[100dvh] flex-col items-center overflow-hidden">
	<!--
    Background plate + decorative ambient blur, both positioned
    behind the content. Rendered as siblings so the blur reads
    against the off-white canvas without bleeding through the
    content cards.
  -->
	<div class="bg-bg absolute inset-0"></div>
	<img
		src="/brand/welcome-blur.svg"
		alt=""
		aria-hidden="true"
		class="pointer-events-none absolute -bottom-32 left-1/2 w-[200%] max-w-none -translate-x-1/2"
	/>

	<div
		class="relative flex w-full flex-1 flex-col items-center pt-[max(env(safe-area-inset-top),42px)]"
	>
		<div class="flex w-full flex-col items-center gap-[56px] px-[29px] pt-[71px]">
			<h1 class="text-default text-h5 text-center font-semibold">
				{$i18n.welcome.greeting_prefix}<span class="font-bold">{$i18n.layout.title}</span>{$i18n
					.welcome.greeting_suffix}
			</h1>

			<div class="flex w-full flex-col items-center gap-[40px]">
				<!--
          Logo animation: animated dashed rings + scattered particles
          layered behind the panda silhouette. Both assets are larger
          than the visible window and intentionally crop on every
          side so the rings appear to extend off-frame.
        -->
				<div class="relative h-[317px] w-[345px] overflow-hidden">
					<img
						src="/brand/welcome-rings.gif"
						alt=""
						aria-hidden="true"
						class="absolute -top-[72px] -left-[48px] h-[430px] w-[430px]"
					/>
					<img
						src="/brand/panda.png"
						alt=""
						aria-hidden="true"
						class="absolute -top-[93px] -left-[64px] h-[435px] w-[436px]"
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
