<script lang="ts">
	import { Principal } from '@icp-sdk/core/principal';
	import { goto } from '$app/navigation';
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
	import { i18n } from '$lib/stores/i18n.store';
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

	const onDispute = () => goto(`/deals/${deal.id}/dispute`);

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
		<Button onclick={onConsent} disabled={progress}>{$i18n.deals.actions.consent}</Button>
	{/if}
	{#if canReject}
		<Button onclick={onReject} disabled={progress}>{$i18n.deals.actions.reject}</Button>
	{/if}
	{#if canCancel}
		<Button onclick={onCancel} disabled={progress}>{$i18n.deals.actions.cancel}</Button>
	{/if}
	{#if canAccept}
		<Button onclick={onAccept} disabled={progress}>{$i18n.deals.actions.accept}</Button>
	{/if}
	{#if canReclaim}
		<Button onclick={onReclaim} disabled={progress}>{$i18n.deals.actions.reclaim}</Button>
	{/if}
	{#if canDispute}
		<button
			type="button"
			onclick={onDispute}
			disabled={progress}
			class="border-border-soft text-default text-body2 rounded-md border-2 border-dashed px-3 py-1 font-bold opacity-70 hover:opacity-100"
			title={$i18n.deals.actions.dispute_tooltip}
			data-tid="dispute-stub"
		>
			{$i18n.deals.actions.dispute}
		</button>
	{/if}
</div>

{#if error !== undefined}
	<p
		class="border-danger bg-danger/10 text-body2 text-danger mt-2 rounded-md border p-2"
		role="alert"
	>
		{error}
	</p>
{/if}

{#if progress}
	<Backdrop spinner />
{/if}
