<script lang="ts">
	import Money from '$lib/components/Money.svelte';
	import { SUPPORTED_TOKENS } from '$lib/constants/tokens.constants';
	import { userSignedIn } from '$lib/derived/user.derived';
	import { myBalance } from '$lib/services/balance.services';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Token } from '$lib/types/token';

	interface Props {
		/** Tokens to surface. Defaults to {@link SUPPORTED_TOKENS} (ICP only today). */
		tokens?: readonly Token[];
	}

	let { tokens = SUPPORTED_TOKENS }: Props = $props();

	type RowState =
		| { status: 'loading' }
		| { status: 'ready'; balance: bigint }
		| { status: 'error' };

	// Keyed by ledger canister id so it stays stable when the list reorders.
	let states = $state<Record<string, RowState>>({});

	$effect(() => {
		const list = tokens;
		const signedIn = $userSignedIn;

		if (!signedIn) {
			states = {};
			return;
		}

		// Late-arriving balances must not clobber a later effect run.
		let cancelled = false;

		const next: Record<string, RowState> = {};
		for (const token of list) {
			next[token.ledgerCanisterId] = { status: 'loading' };
		}
		states = next;

		for (const token of list) {
			(async () => {
				try {
					const balance = await myBalance({ token });
					if (cancelled) {
						return;
					}
					states = {
						...states,
						[token.ledgerCanisterId]: { status: 'ready', balance }
					};
				} catch (err) {
					if (cancelled) {
						return;
					}
					console.error(`Failed to load ${token.symbol} balance:`, err);
					states = {
						...states,
						[token.ledgerCanisterId]: { status: 'error' }
					};
				}
			})();
		}

		return () => {
			cancelled = true;
		};
	});
</script>

<ul class="flex flex-col">
	{#each tokens as token (token.ledgerCanisterId)}
		{@const state = states[token.ledgerCanisterId]}
		<li
			class="flex items-center justify-between border-b border-[var(--color-border-soft)] py-[14px]"
		>
			<span class="text-default font-sans text-[18px] font-normal">{token.name}</span>
			{#if state === undefined || state.status === 'loading'}
				<span class="text-muted text-body2" aria-live="polite">{$i18n.wallet.loading}</span>
			{:else if state.status === 'error'}
				<span class="text-danger text-body2">{$i18n.wallet.error}</span>
			{:else}
				<Money amount={state.balance} {token} size="md" />
			{/if}
		</li>
	{/each}
</ul>
