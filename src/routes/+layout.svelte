<script lang="ts">
	import { initSatellite } from '@junobuild/core';
	import type { Snippet } from 'svelte';
	import Auth from '$lib/components/Auth.svelte';
	import Background from '$lib/components/Background.svelte';
	import Footer from '$lib/components/Footer.svelte';
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
	};

	$effect(() => {
		init();
	});
</script>

<div class="relative isolate min-h-[100dvh]">
	<main class="tall:min-h-[calc(100dvh-128px)] mx-auto max-w-screen-2xl px-8 py-16 md:px-24">
		<h1 class="text-5xl font-bold tracking-tight md:pt-24 md:text-6xl dark:text-white">PandaMe</h1>
		<p class="py-4 md:max-w-lg dark:text-white">
			A trustless escrow on the
			<a
				href="https://internetcomputer.org"
				rel="noopener noreferrer"
				target="_blank"
				class="underline"
			>
				Internet Computer
			</a>. Lock funds against a known counterparty, share a tip link with anyone, or reclaim what's
			yours after expiry — all from a single Juno-powered Internet Identity session.
		</p>

		<Auth>
			{@render children()}
		</Auth>
	</main>

	<Footer />

	<Background />
</div>
