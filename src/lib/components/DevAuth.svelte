<script lang="ts">
	import type { User } from '@junobuild/core';
	import { browser, dev } from '$app/environment';
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
	 * The store is set **synchronously during script init** (not in
	 * `onMount`) so it's already populated before any auth-guarded
	 * route's own `$effect` runs — otherwise AuthGuard fires its
	 * redirect on first paint, before DevAuth has a chance to lie
	 * about the user.
	 *
	 * Usage: `npm run dev`, then visit
	 * http://localhost:5173/?dev=1 (the query persists across SPA
	 * navigations because nothing in the app strips it).
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

	if (dev && browser) {
		const params = new URLSearchParams(window.location.search);
		if (params.has('dev')) {
			userStore.set(MOCK_USER);
		}
	}
</script>
