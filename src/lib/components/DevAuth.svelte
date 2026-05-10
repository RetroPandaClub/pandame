<script lang="ts">
	import type { User } from '@junobuild/core';
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { userStore } from '$lib/stores/user.store';

	/*
	 * Dev-only auth bypass. Mounted once at the layout level. When
	 * the URL contains `?dev=1` AND we're in a dev build (`vite dev`),
	 * pre-populate `userStore` with a deterministic mock user so the
	 * authenticated routes render without going through Internet
	 * Identity. Tree-shaken out of production builds — the entire
	 * effect is gated by `dev`, which `import.meta.env.DEV` resolves
	 * to `false` at build time.
	 *
	 * Usage: `npm run dev`, then visit http://localhost:5173/?dev=1
	 * (the query persists across SPA navigations because nothing in
	 * the app strips it).
	 */
	const MOCK_USER: User = {
		key: 'aaaaa-aa',
		owner: 'aaaaa-aa',
		// `User` extends `Doc<UserData>` from @junobuild/core; the rest of
		// the fields are runtime-only and undefined for our mock.
		data: undefined as never,
		created_at: 0n,
		updated_at: 0n,
		version: 0n
	};

	onMount(() => {
		if (!dev) {
			return;
		}

		const params = new URLSearchParams(window.location.search);
		if (!params.has('dev')) {
			return;
		}

		userStore.set(MOCK_USER);
	});
</script>
