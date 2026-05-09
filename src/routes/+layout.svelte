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
     no global hero, footer or chrome. -->
<div class="bg-bg-soft min-h-[100dvh] pb-[env(safe-area-inset-bottom)]">
	<div class="bg-bg shadow-primary/10 mx-auto flex min-h-[100dvh] max-w-[420px] flex-col shadow-xl">
		{@render children()}
	</div>
</div>

<Auth />
