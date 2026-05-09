<script lang="ts">
	import { Principal } from '@icp-sdk/core/principal';
	import { goto } from '$app/navigation';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import Backdrop from '$lib/components/Backdrop.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import Button from '$lib/components/Button.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import ShareLinkModal from '$lib/components/ShareLinkModal.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import VoteQuorumPicker, { type Quorum } from '$lib/components/VoteQuorumPicker.svelte';
	import { ICP_TOKEN } from '$lib/constants/tokens.constants';
	import { userSignedIn } from '$lib/derived/user.derived';
	import { createAndFundDeal } from '$lib/services/deal.services';
	import { dealsStore } from '$lib/stores/deals.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { userStore } from '$lib/stores/user.store';
	import type { Deal } from '$lib/types/deal';
	import {
		formatTokenAmount,
		msToNs,
		parseTokenAmount,
		shortPrincipal
	} from '$lib/utils/format.utils';

	type Mode = 'pay' | 'receive';

	let mode: Mode = $state('pay');
	let counterpartyText = $state('');
	let amountText = $state('');
	let tenorLocal = $state(defaultTenor());
	let quorum: Quorum = $state('fair');

	let progress = $state(false);
	let error: string | undefined = $state(undefined);
	let createdDeal: Deal | undefined = $state(undefined);

	const token = ICP_TOKEN;

	let amount = $derived(parseTokenAmount(amountText, token));
	let counterparty = $derived(parsePrincipal(counterpartyText));
	let tenorMs = $derived(Date.parse(tenorLocal));
	let tenorNs = $derived(Number.isFinite(tenorMs) ? msToNs(tenorMs) : undefined);

	let valid = $derived(
		amount !== undefined &&
			amount > 0n &&
			tenorNs !== undefined &&
			tenorMs > Date.now() &&
			(counterpartyText.trim().length === 0 || counterparty !== undefined)
	);

	let principalLabel = $derived(
		$userStore?.key !== undefined ? shortPrincipal($userStore.key) : ''
	);

	let totalAmount = $derived(amount !== undefined ? amount + token.fee : undefined);

	$effect(() => {
		if (!$userSignedIn) {
			goto('/');
		}
	});

	const submit = async () => {
		if (!valid || amount === undefined || tenorNs === undefined) {
			return;
		}

		progress = true;
		error = undefined;

		try {
			const { funded } = await createAndFundDeal({
				amount,
				expires_at_ns: tenorNs,
				token,
				...(mode === 'pay' ? { recipient: counterparty } : { payer: counterparty })
			});

			dealsStore.upsert(funded);
			createdDeal = funded;
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			console.error('createAndFundDeal failed:', err);
		} finally {
			progress = false;
		}
	};

	const onShareDone = () => {
		createdDeal = undefined;
		goto('/');
	};

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

	function defaultTenor(): string {
		const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
		const offsetMs = date.getTime() - date.getTimezoneOffset() * 60_000;

		return new Date(offsetMs).toISOString().slice(0, 16);
	}

	let counterpartyLabel = $derived(
		mode === 'pay' ? $i18n.create.counterparty_label_pay : $i18n.create.counterparty_label_receive
	);
</script>

<svelte:head>
	<title>{$i18n.create.title} · {$i18n.layout.title}</title>
</svelte:head>

<BrandHeader title={$i18n.layout.title}>
	{#snippet leading()}
		<IconButton
			ariaLabel={$i18n.core.text.back_to_dashboard}
			variant="ghost"
			onclick={() => goto('/')}
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M15 18l-6-6 6-6" />
			</svg>
		</IconButton>
	{/snippet}

	{#snippet trailing()}
		<span class="text-body2 font-bold text-white">{principalLabel}</span>
		<Avatar fallback={principalLabel} size="md" alt={principalLabel} />
	{/snippet}

	<Tabs
		bind:value={mode}
		ariaLabel="Deal direction"
		tabs={[
			{ id: 'pay', label: $i18n.create.mode_pay },
			{ id: 'receive', label: $i18n.create.mode_receive }
		]}
	/>
</BrandHeader>

<form
	class="flex flex-1 flex-col gap-4 px-6 pt-6 pb-28"
	onsubmit={(e) => {
		e.preventDefault();
		submit();
	}}
>
	<FormField label={counterpartyLabel} htmlFor="counterparty">
		<TextInput
			id="counterparty"
			mono
			bind:value={counterpartyText}
			placeholder={$i18n.create.recipient_placeholder}
			disabled={progress}
			invalid={counterpartyText.trim().length > 0 && counterparty === undefined}
		/>
	</FormField>

	<div class="grid grid-cols-[1fr_auto] gap-3">
		<FormField label={$i18n.create.summary_amount} htmlFor="amount">
			<TextInput
				id="amount"
				inputmode="decimal"
				bind:value={amountText}
				placeholder="0.0"
				disabled={progress}
				invalid={amountText.length > 0 && (amount === undefined || amount <= 0n)}
			/>
		</FormField>

		<FormField label={$i18n.create.currency_label} htmlFor="currency">
			<TextInput id="currency" value={token.symbol} readonly disabled />
		</FormField>
	</div>

	<FormField label={$i18n.create.tenor_label} htmlFor="tenor">
		<TextInput
			id="tenor"
			type="datetime-local"
			bind:value={tenorLocal}
			disabled={progress}
			invalid={tenorMs <= Date.now()}
		/>
	</FormField>

	<div class="flex flex-col gap-3">
		<div class="flex items-baseline justify-between">
			<span class="text-body2 text-default font-bold">{$i18n.create.votes_label}</span>
			<span class="text-xxs text-muted">{$i18n.deals.actions.dispute}</span>
		</div>
		<VoteQuorumPicker bind:value={quorum} disabled />
		<small class="text-xxs text-muted">{$i18n.create.votes_disabled_hint}</small>
	</div>

	<dl class="bg-bg-soft text-body2 flex flex-col gap-1 rounded-md p-4">
		<div class="flex justify-between">
			<dt class="text-muted">{$i18n.create.summary_amount}</dt>
			<dd class="text-default font-mono">
				{amount !== undefined ? formatTokenAmount(amount, token) : `— ${token.symbol}`}
			</dd>
		</div>
		<div class="flex justify-between">
			<dt class="text-muted">{$i18n.create.summary_fee}</dt>
			<dd class="text-default font-mono">{formatTokenAmount(token.fee, token)}</dd>
		</div>
		<div class="border-border-soft mt-1 flex justify-between border-t pt-1">
			<dt class="text-default font-bold">{$i18n.create.summary_total}</dt>
			<dd class="text-default font-mono font-bold">
				{totalAmount !== undefined ? formatTokenAmount(totalAmount, token) : `— ${token.symbol}`}
			</dd>
		</div>
	</dl>

	{#if error !== undefined}
		<p class="border-danger bg-danger/10 text-body2 text-danger rounded-md border p-3" role="alert">
			{error}
		</p>
	{/if}

	<Button type="submit" disabled={!valid} loading={progress} fullWidth>
		{progress ? $i18n.create.submitting : $i18n.create.submit}
	</Button>
</form>

<AppBottomNav />

{#if createdDeal !== undefined}
	<ShareLinkModal
		open
		dealId={createdDeal.id}
		claimCode={createdDeal.claim_code}
		onclose={onShareDone}
	/>
{/if}

{#if progress}
	<Backdrop spinner />
{/if}
