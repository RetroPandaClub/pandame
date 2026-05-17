<script lang="ts">
	import { userSignedIn } from '$lib/derived/user.derived';
	import { listMyDeals } from '$lib/services/deal.services';
	import { listMyDisputes } from '$lib/services/dispute.services';
	import { dealsStore } from '$lib/stores/deals.store';
	import { disputesStore } from '$lib/stores/disputes.store';
	import { emit } from '$lib/utils/events.utils';

	const POLL_INTERVAL_MS = 30_000;

	// One canister failing doesn't poison the other store.
	const reloadDealsAndDisputes = async () => {
		const [deals, disputes] = await Promise.all([
			listMyDeals().catch((err) => {
				console.error('Failed to refresh deals:', err);
				return undefined;
			}),
			listMyDisputes().catch((err) => {
				console.error('Failed to refresh disputes:', err);
				return undefined;
			})
		]);

		if (deals !== undefined) {
			dealsStore.set(deals);
		}

		if (disputes !== undefined) {
			disputesStore.set(disputes);
		}
	};

	// Reset on sign-out so the next session shows loading, not the
	// previous user's data.
	$effect(() => {
		if (!$userSignedIn) {
			dealsStore.reset();
			disputesStore.reset();
			return;
		}

		emit({ message: 'pandameReloadDeals' });
		const id = setInterval(() => emit({ message: 'pandameReloadDeals' }), POLL_INTERVAL_MS);
		return () => clearInterval(id);
	});
</script>

<svelte:window onpandameReloadDeals={reloadDealsAndDisputes} />
