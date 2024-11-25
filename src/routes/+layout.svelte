<script lang="ts">
	import { initSatellite } from '@junobuild/core-peer';
	import type { Snippet } from 'svelte';
	import Auth from '$lib/components/Auth.svelte';
	import Background from '$lib/components/Background.svelte';
	import Footer from '$lib/components/Footer.svelte';
	// import '../app.css';

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
	};

	$effect(() => {
		init();
	});
</script>

<div class="relative isolate min-h-[100dvh]">
	<main class="mx-auto max-w-screen-2xl px-8 py-16 md:px-24 tall:min-h-[calc(100dvh-128px)]">
		<h1 class="text-5xl font-bold tracking-tight md:pt-24 md:text-6xl dark:text-white">
			Example App
		</h1>
		<p class="py-4 md:max-w-lg dark:text-white">
			Explore this demo app built with SvelteKit, Tailwind, and
			<a href="https://juno.build" rel="noopener noreferrer" target="_blank" class="underline">
				Juno</a
			>, showcasing a practical application of these technologies.
		</p>

		<Auth>
			{@render children()}
		</Auth>
	</main>

	<Footer />

	<Background />
</div>
