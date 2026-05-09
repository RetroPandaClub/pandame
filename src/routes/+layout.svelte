<script lang="ts">
	import { initSatellite } from '@junobuild/core';
	import type { Snippet } from 'svelte';
	import Auth from '$lib/components/Auth.svelte';
	import Background from '$lib/components/Background.svelte';
	import Footer from '$lib/components/Footer.svelte';
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

<div class="relative isolate min-h-[100dvh]">
	<main class="tall:min-h-[calc(100dvh-128px)] mx-auto max-w-screen-2xl px-8 py-16 md:px-24">
		<h1 class="text-5xl font-bold tracking-tight md:pt-24 md:text-6xl dark:text-white">
			{$i18n.layout.title}
		</h1>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<p class="py-4 md:max-w-lg dark:text-white">{@html $i18n.layout.tagline_html}</p>

		<Auth>
			{@render children()}
		</Auth>
	</main>

	<Footer />

	<Background />
</div>
