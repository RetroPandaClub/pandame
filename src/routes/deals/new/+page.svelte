<script lang="ts">
	import { Principal } from '@icp-sdk/core/principal';
	import { goto } from '$app/navigation';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import Backdrop from '$lib/components/Backdrop.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import Button from '$lib/components/Button.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import InfoLink from '$lib/components/InfoLink.svelte';
	import ShareLinkModal from '$lib/components/ShareLinkModal.svelte';
	import Sheet from '$lib/components/Sheet.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import TermsCheckbox from '$lib/components/TermsCheckbox.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import UploadCTA from '$lib/components/UploadCTA.svelte';
	import UserPrincipalBadge from '$lib/components/UserPrincipalBadge.svelte';
	import VoteQuorumPicker, { type Quorum } from '$lib/components/VoteQuorumPicker.svelte';
	import BackIcon from '$lib/components/icons/BackIcon.svelte';
	import { ICP_TOKEN } from '$lib/constants/tokens.constants';
	import { createAndFundDeal } from '$lib/services/deal.services';
	import { dealsStore } from '$lib/stores/deals.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Deal } from '$lib/types/deal';
	import { formatTokenAmount, msToNs, parseTokenAmount } from '$lib/utils/format.utils';

	type Mode = 'pay' | 'receive';

	let mode: Mode = $state('pay');
	let counterpartyText = $state('');
	let amountText = $state('');
	let tenorLocal = $state(defaultTenor());
	let titleDeal = $state('');
	let agreement = $state('');
	let quorum: Quorum = $state('fair');
	let termsAgreed = $state(false);

	let progress = $state(false);
	let error: string | undefined = $state(undefined);
	let createdDeal: Deal | undefined = $state(undefined);

	const token = ICP_TOKEN;

	let amount = $derived(parseTokenAmount(amountText, token));
	let counterparty = $derived(parsePrincipal(counterpartyText));
	let tenorMs = $derived(Date.parse(tenorLocal));
	let tenorNs = $derived(Number.isFinite(tenorMs) ? msToNs(tenorMs) : undefined);

	let valid = $derived(
		termsAgreed &&
			amount !== undefined &&
			amount > 0n &&
			tenorNs !== undefined &&
			tenorMs > Date.now() &&
			(counterpartyText.trim().length === 0 || counterparty !== undefined)
	);

	let totalAmount = $derived(amount !== undefined ? amount + token.fee : undefined);

	const submit = async () => {
		if (!valid || amount === undefined || tenorNs === undefined) {
			return;
		}

		progress = true;
		error = undefined;

		try {
			const recipientPrincipal =
				mode === 'pay' && counterparty !== undefined ? counterparty : undefined;
			const payerPrincipal =
				mode === 'receive' && counterparty !== undefined ? counterparty : undefined;

			const { funded } = await createAndFundDeal({
				amount,
				expires_at_ns: tenorNs,
				recipient: recipientPrincipal,
				payer: payerPrincipal,
				title: titleDeal.trim() || undefined,
				note: agreement.trim() || undefined,
				token
			});

			dealsStore.upsert(funded);
			createdDeal = funded;
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			progress = false;
		}
	};

	const closeShare = async () => {
		createdDeal = undefined;
		await goto('/history');
	};

	function parsePrincipal(text: string): Principal | undefined {
		if (text.trim().length === 0) {
			return undefined;
		}
		try {
			return Principal.fromText(text.trim());
		} catch {
			return undefined;
		}
	}

	function defaultTenor(): string {
		const nowMs = Date.now();
		const tzOffsetMs = new Date(nowMs).getTimezoneOffset() * 60_000;
		const localNowMs = nowMs - tzOffsetMs;
		const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
		return new Date(localNowMs + sevenDaysMs).toISOString().slice(0, 16);
	}
</script>

<svelte:head>
	<title>{$i18n.create.title} · {$i18n.layout.title}</title>
</svelte:head>

<AuthGuard />

<BrandHeader title={$i18n.layout.title}>
	{#snippet leading()}
		<button
			type="button"
			aria-label={$i18n.core.text.back_to_dashboard}
			onclick={() => goto('/')}
			class="text-default-inverse flex h-[24px] w-[24px] items-center justify-center"
		>
			<BackIcon />
		</button>
	{/snippet}

	{#snippet trailing()}
		<UserPrincipalBadge />
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

<Sheet paddingClass="px-[19px] pt-[34px] pb-[140px]" class="gap-[18px] overflow-y-auto">
	<form
		class="flex flex-col gap-[18px]"
		onsubmit={(e) => {
			e.preventDefault();
			submit();
		}}
	>
		<FormField
			label={mode === 'pay' ? $i18n.create.payer_wallet_label : $i18n.create.recipient_wallet_label}
			htmlFor="counterparty"
		>
			<TextInput id="counterparty" bind:value={counterpartyText} placeholder="abcde-12345-…" />
		</FormField>

		<div class="flex flex-col gap-[8px]">
			<div class="flex items-center justify-between">
				<span class="text-default text-figma-16 font-serif-ui font-medium tracking-[-0.32px]">
					{$i18n.create.amount_label}
				</span>
				<span class="text-default text-figma-16 font-serif-ui font-medium tracking-[-0.32px]">
					{$i18n.create.currency_label}
				</span>
			</div>
			<div class="flex items-center gap-[10px]">
				<TextInput
					id="amount"
					bind:value={amountText}
					placeholder="0.5"
					inputmode="decimal"
					variant="active"
				/>
				<span
					class="border-primary-stroke text-primary-stroke rounded-input flex h-[41px] shrink-0 items-center px-[14px] font-sans text-[14px]"
				>
					{token.symbol}
				</span>
			</div>
		</div>

		<FormField label={$i18n.create.tenor_label} htmlFor="tenor" labelFamily="serif-ui">
			<TextInput id="tenor" type="datetime-local" bind:value={tenorLocal} />
		</FormField>

		<div class="flex flex-col gap-[12px]">
			<span class="text-default text-figma-16 font-sans font-medium tracking-[-0.32px]">
				{$i18n.create.votes_label}
			</span>
			<VoteQuorumPicker bind:value={quorum} disabled />
			<small class="text-muted text-xxs">{$i18n.create.votes_disabled_hint}</small>
		</div>

		<section class="flex flex-col gap-[8px]">
			<h3 class="text-default text-figma-16 font-sans font-medium tracking-[-0.32px]">
				{$i18n.create.summary_label}
			</h3>
			<dl
				class="text-default font-serif-ui text-figma-14 grid grid-cols-[1fr_auto] gap-y-[6px] font-medium tracking-[-0.28px]"
			>
				<dt>{$i18n.create.summary_amount}</dt>
				<dd class="text-right">
					{amount !== undefined ? formatTokenAmount(amount, token) : `0 ${token.symbol}`}
				</dd>
				<dt>{$i18n.create.summary_fee}</dt>
				<dd class="text-right">{formatTokenAmount(token.fee, token)}</dd>
				<dt class="font-sans font-medium">{$i18n.create.summary_total}</dt>
				<dd class="text-right font-sans font-semibold">
					{totalAmount !== undefined ? formatTokenAmount(totalAmount, token) : '—'}
				</dd>
			</dl>
		</section>

		<FormField label={$i18n.create.title_deal_label} htmlFor="title-deal">
			<TextInput
				id="title-deal"
				bind:value={titleDeal}
				placeholder={$i18n.create.title_deal_placeholder}
			/>
		</FormField>

		<FormField label={$i18n.create.agreement_label} htmlFor="agreement-details">
			<textarea
				id="agreement-details"
				bind:value={agreement}
				placeholder={$i18n.create.agreement_placeholder}
				class="bg-bg-elevated text-default placeholder:text-subtle border-border rounded-input focus:border-primary-stroke focus:ring-primary-stroke/20 min-h-[154px] w-full resize-none border-[1.5px] px-[10px] py-[10px] font-sans text-[14px] focus:ring-2 focus:outline-none"
			></textarea>
		</FormField>

		<div class="flex flex-col gap-[8px]">
			<span class="text-default text-figma-16 font-serif-ui font-medium tracking-[-0.32px]">
				{$i18n.create.add_documents_label}
			</span>
			<UploadCTA label={$i18n.create.upload_cta} caption={$i18n.create.upload_caption} />
		</div>

		<TermsCheckbox
			id="terms"
			bind:checked={termsAgreed}
			prefix={$i18n.create.terms_prefix}
			brand={$i18n.create.terms_brand}
			linkLabel={$i18n.create.terms_link}
			linkHref="https://github.com/AntonioVentilii/escrow"
			suffix=""
		/>

		{#if error !== undefined}
			<p class="text-danger text-body2" role="alert">{error}</p>
		{/if}

		<Button type="submit" fullWidth disabled={!valid} loading={progress}>
			{progress ? $i18n.create.submitting : $i18n.create.submit}
		</Button>

		<InfoLink label={$i18n.create.help_label} href="https://github.com/AntonioVentilii/escrow" />
	</form>
</Sheet>

<AppBottomNav />

{#if createdDeal !== undefined}
	<ShareLinkModal
		open={true}
		dealId={createdDeal.id}
		claimCode={createdDeal.claim_code}
		onclose={closeShare}
	/>
{/if}

{#if progress}
	<Backdrop spinner />
{/if}
