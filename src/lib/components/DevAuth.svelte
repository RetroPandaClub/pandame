<script lang="ts">
	import type { User } from '@junobuild/core';
	import { browser, dev } from '$app/environment';
	import { userStore } from '$lib/stores/user.store';

	// Dev-only auth bypass; tree-shaken out of prod by `dev`. Set
	// synchronously here (not in `onMount`) so AuthGuard sees the
	// user before its first redirect-on-mount fires.
	// Usage: `npm run dev` → http://localhost:5173/?dev=1
	const MOCK_USER: User = {
		key: 'aaaaa-aa',
		owner: 'aaaaa-aa',
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
