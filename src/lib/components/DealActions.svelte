<script lang="ts">
	import { Principal } from '@icp-sdk/core/principal';
	import Backdrop from '$lib/components/Backdrop.svelte';
	import Button from '$lib/components/Button.svelte';
	import { ConsentStates, DealStatuses } from '$lib/enums/deal-status';
	import {
		acceptDeal,
		cancelDeal,
		consentDeal,
		reclaimDeal,
		rejectDeal
	} from '$lib/services/deal.services';
	import { dealsStore } from '$lib/stores/deals.store';
	import { userStore } from '$lib/stores/user.store';
	import type { Deal, DealSide } from '$lib/types/deal';
	import { consentState, dealStatus, sideOf } from '$lib/utils/deal.utils';

	interface Props {
		deal: Deal;
	}

	let { deal }: Props = $props();

	let progress = $state(false);
	let error: string | undefined = $state(undefined);

	let principal = $derived(parsePrincipal($userStore?.key));
	let mySide: DealSide = $derived(sideOf(deal, principal));
	let status = $derived(dealStatus(deal));
	let myConsent = $derived(
		mySide === 'payer'
			? consentState(deal.payer_consent)
			: mySide === 'recipient'
				? consentState(deal.recipient_consent)
				: undefined
	);
	let nowNs = $state(BigInt(Date.now()) * 1_000_000n);

	$effect(() => {
		const id = window.setInterval(() => {
			nowNs = BigInt(Date.now()) * 1_000_000n;
		}, 30_000);

		return () => window.clearInterval(id);
	});

	let expired = $derived(deal.expires_at_ns <= nowNs);

	const canConsent = $derived(
		mySide !== 'unknown' && status === DealStatuses.Created && myConsent !== ConsentStates.Accepted
	);
	const canReject = $derived(
		mySide !== 'unknown' && status === DealStatuses.Created && myConsent !== ConsentStates.Rejected
	);
	const canCancel = $derived(mySide !== 'unknown' && status === DealStatuses.Created);
	const canAccept = $derived(mySide === 'recipient' && status === DealStatuses.Funded);
	const canReclaim = $derived(mySide === 'payer' && status === DealStatuses.Funded && expired);
	const canDispute = $derived(status === DealStatuses.Funded);

	const wrap = async (op: string, action: () => Promise<Deal>) => {
		progress = true;
		error = undefined;

		try {
			const updated = await action();
			dealsStore.upsert(updated);
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			console.error(`${op} failed:`, err);
		} finally {
			progress = false;
		}
	};

	const onConsent = () => wrap('consentDeal', () => consentDeal({ dealId: deal.id }));
	const onReject = () => wrap('rejectDeal', () => rejectDeal({ dealId: deal.id }));
	const onCancel = () => wrap('cancelDeal', () => cancelDeal({ dealId: deal.id }));
	const onAccept = () => wrap('acceptDeal', () => acceptDeal({ dealId: deal.id }));
	const onReclaim = () => wrap('reclaimDeal', () => reclaimDeal({ dealId: deal.id }));

	let disputeNotice = $state(false);
	const onDispute = () => (disputeNotice = true);

	function parsePrincipal(text: string | undefined): Principal | undefined {
		if (text === undefined || text.length === 0) {
			return undefined;
		}

		try {
			return Principal.fromText(text);
		} catch {
			return undefined;
		}
	}
</script>

<div class="flex flex-wrap items-center gap-2">
	{#if canConsent}
		<Button onclick={onConsent} disabled={progress}>Consent</Button>
	{/if}
	{#if canReject}
		<Button onclick={onReject} disabled={progress}>Reject</Button>
	{/if}
	{#if canCancel}
		<Button onclick={onCancel} disabled={progress}>Cancel</Button>
	{/if}
	{#if canAccept}
		<Button onclick={onAccept} disabled={progress}>Accept</Button>
	{/if}
	{#if canReclaim}
		<Button onclick={onReclaim} disabled={progress}>Reclaim</Button>
	{/if}
	{#if canDispute}
		<button
			type="button"
			onclick={onDispute}
			disabled={progress}
			class="rounded-sm border-[3px] border-dashed border-black/40 px-3 py-1 text-sm font-semibold opacity-70 hover:opacity-100 dark:border-white/40 dark:text-white"
			title="Dispute resolution will land in a future canister upgrade."
			data-tid="dispute-stub"
		>
			Dispute (soon)
		</button>
	{/if}
</div>

{#if error !== undefined}
	<p class="mt-2 rounded-sm border-2 border-red-600 bg-red-50 p-2 text-xs text-red-700">
		{error}
	</p>
{/if}

{#if disputeNotice}
	<div
		class="mt-2 rounded-sm border-2 border-dashed border-black/40 p-3 text-xs dark:border-white/40 dark:text-white"
		role="note"
	>
		Dispute resolution is on the roadmap (Product.docx §Evaluation). The escrow canister does not
		yet support a <code>Disputed</code> state — track progress in
		<a
			href="https://github.com/AntonioVentilii/escrow/blob/main/src/escrow/README.md#future-expansion"
			target="_blank"
			rel="noopener noreferrer"
			class="underline"
		>
			the escrow repo</a
		>.
	</div>
{/if}

{#if progress}
	<Backdrop spinner />
{/if}
