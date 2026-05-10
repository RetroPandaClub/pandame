<script lang="ts">
	import { initSatellite } from '@junobuild/core';
	import type { Snippet } from 'svelte';
	import Auth from '$lib/components/Auth.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	// eslint-disable-next-line import/no-relative-parent-imports
	import '../app.css';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const init = async () => {
		await initSatellite({
			workers: {
				auth: true
			}
		});

		await i18n.init();
	};

	$effect(() => {
		init();
	});
</script>

<!-- Mobile-first phone shell: edge-to-edge on phones, centered 420 px
     "device frame" on tablet / desktop. Pages render directly inside —
     no global hero, footer or chrome. The inner frame uses `w-full`
     so it reliably fills its allotted width (rather than collapsing to
     the intrinsic width of flex children — which would skip absolute
     content like the welcome panda artwork). -->
<!-- Bottom safe-area is owned by the BottomNav (logged-in routes) or
     the page footer (WelcomeScreen) — adding it to the wash too makes
     the page taller than the viewport on iOS, which is where the
     few-pixel scroll on the home screen was coming from. -->
<div class="bg-bg-soft flex min-h-[100dvh] justify-center">
	<div class="bg-bg shadow-primary/10 flex min-h-[100dvh] w-full max-w-[420px] flex-col shadow-xl">
		{@render children()}
	</div>
</div>

<Auth />
