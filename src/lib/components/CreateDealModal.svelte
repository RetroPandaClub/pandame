<script lang="ts">
	import { Principal } from '@icp-sdk/core/principal';
	import Backdrop from '$lib/components/Backdrop.svelte';
	import Button from '$lib/components/Button.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { ICP_TOKEN } from '$lib/constants/tokens.constants';
	import { createAndFundDeal } from '$lib/services/deal.services';
	import type { Deal } from '$lib/types/deal';
	import { formatTokenAmount, msToNs, parseTokenAmount } from '$lib/utils/format.utils';

	interface Props {
		open: boolean;
		onclose?: () => void;
		oncreated?: (deal: Deal) => void;
	}

	let { open, onclose = () => {}, oncreated = () => {} }: Props = $props();

	let title = $state('');
	let note = $state('');
	let recipientText = $state('');
	let amountText = $state('');
	let expiresAtLocal = $state(defaultExpiry());

	let progress = $state(false);
	let error: string | undefined = $state(undefined);

	let token = ICP_TOKEN;

	let amount = $derived(parseTokenAmount(amountText, token));
	let recipient = $derived(parsePrincipal(recipientText));

	let expiresAtMs = $derived(Date.parse(expiresAtLocal));
	let expiresAtNs = $derived(Number.isFinite(expiresAtMs) ? msToNs(expiresAtMs) : undefined);

	let valid = $derived(
		amount !== undefined &&
			amount > 0n &&
			expiresAtNs !== undefined &&
			expiresAtMs > Date.now() &&
			(recipientText.trim().length === 0 || recipient !== undefined)
	);

	const submit = async () => {
		if (!valid || amount === undefined || expiresAtNs === undefined) {
			return;
		}

		progress = true;
		error = undefined;

		try {
			const { funded } = await createAndFundDeal({
				amount,
				expires_at_ns: expiresAtNs,
				title: title.trim() || undefined,
				note: note.trim() || undefined,
				recipient,
				token
			});

			reset();
			onclose();
			oncreated(funded);
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			console.error('createAndFundDeal failed:', err);
		} finally {
			progress = false;
		}
	};

	function reset() {
		title = '';
		note = '';
		recipientText = '';
		amountText = '';
		expiresAtLocal = defaultExpiry();
		error = undefined;
	}

	function parsePrincipal(text: string): Principal | undefined {
		const trimmed = text.trim();

		if (trimmed.length === 0) {
			return undefined;
		}

		try {
			return Principal.fromText(trimmed);
		} catch {
			return undefined;
		}
	}

	function defaultExpiry(): string {
		// Default to 7 days from now, formatted for `<input type="datetime-local">`.
		const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
		const offsetMs = date.getTime() - date.getTimezoneOffset() * 60_000;

		return new Date(offsetMs).toISOString().slice(0, 16);
	}
</script>

<Modal
	{open}
	onclose={() => {
		if (!progress) {
			onclose();
		}
	}}
	title="Create a deal"
>
	<label class="block">
		<span class="text-sm font-semibold">Title (optional)</span>
		<input
			type="text"
			placeholder="e.g. Coffee for Alice"
			bind:value={title}
			disabled={progress}
			class="mt-1 w-full rounded-sm border-[3px] border-black bg-white px-3 py-1.5 dark:bg-black dark:text-white"
			data-tid="create-deal-title"
		/>
	</label>

	<label class="block">
		<span class="text-sm font-semibold">Note (optional)</span>
		<textarea
			rows={3}
			placeholder="Add a short message"
			bind:value={note}
			disabled={progress}
			class="mt-1 w-full resize-none rounded-sm border-[3px] border-black bg-white px-3 py-1.5 dark:bg-black dark:text-white"
			data-tid="create-deal-note"
		></textarea>
	</label>

	<label class="block">
		<span class="text-sm font-semibold">Recipient principal (optional)</span>
		<input
			type="text"
			placeholder="Leave empty for a tip / share-link flow"
			bind:value={recipientText}
			disabled={progress}
			class="mt-1 w-full rounded-sm border-[3px] border-black bg-white px-3 py-1.5 font-mono text-sm dark:bg-black dark:text-white"
			data-tid="create-deal-recipient"
		/>
		{#if recipientText.trim().length > 0 && recipient === undefined}
			<small class="text-red-600">Not a valid principal.</small>
		{/if}
	</label>

	<label class="block">
		<span class="text-sm font-semibold">Amount ({token.symbol})</span>
		<input
			type="text"
			inputmode="decimal"
			placeholder={`e.g. 0.5 — fee ≈ ${formatTokenAmount(token.fee, token)}`}
			bind:value={amountText}
			disabled={progress}
			class="mt-1 w-full rounded-sm border-[3px] border-black bg-white px-3 py-1.5 dark:bg-black dark:text-white"
			data-tid="create-deal-amount"
		/>
		{#if amountText.length > 0 && (amount === undefined || amount <= 0n)}
			<small class="text-red-600">Enter a positive amount.</small>
		{/if}
	</label>

	<label class="block">
		<span class="text-sm font-semibold">Expires at</span>
		<input
			type="datetime-local"
			bind:value={expiresAtLocal}
			disabled={progress}
			class="mt-1 w-full rounded-sm border-[3px] border-black bg-white px-3 py-1.5 dark:bg-black dark:text-white"
			data-tid="create-deal-expiry"
		/>
		{#if expiresAtMs <= Date.now()}
			<small class="text-red-600">Expiry must be in the future.</small>
		{/if}
	</label>

	{#if error !== undefined}
		<p class="rounded-sm border-2 border-red-600 bg-red-50 p-2 text-sm text-red-700">
			{error}
		</p>
	{/if}

	{#snippet footer()}
		<Button onclick={onclose} disabled={progress}>Cancel</Button>
		<Button onclick={submit} disabled={!valid || progress}>
			{progress ? 'Creating…' : 'Create & fund'}
		</Button>
	{/snippet}
</Modal>

{#if progress}
	<Backdrop spinner />
{/if}
