<script lang="ts">
	import { fromNullable } from '@dfinity/utils';
	import { Principal } from '@icp-sdk/core/principal';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import Backdrop from '$lib/components/Backdrop.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import Button from '$lib/components/Button.svelte';
	import Countdown from '$lib/components/Countdown.svelte';
	import DisputePhaseBadge from '$lib/components/DisputePhaseBadge.svelte';
	import EvidenceForm from '$lib/components/EvidenceForm.svelte';
	import EvidenceList from '$lib/components/EvidenceList.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import VotePicker from '$lib/components/VotePicker.svelte';
	import { ICP_TOKEN } from '$lib/constants/tokens.constants';
	import { userPrincipalText } from '$lib/derived/user.derived';
	import { DisputePhases, type VoteName } from '$lib/enums/dispute';
	import { getDeal } from '$lib/services/deal.services';
	import {
		castVote,
		finalizeDispute,
		getDispute,
		openDispute,
		submitEvidence,
		withdrawDispute
	} from '$lib/services/dispute.services';
	import { dealsStore } from '$lib/stores/deals.store';
	import { disputesStore } from '$lib/stores/disputes.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Deal, DealSide } from '$lib/types/deal';
	import type { Dispute } from '$lib/types/dispute';
	import { sideOf } from '$lib/utils/deal.utils';
	import {
		disputePhase,
		isOnPanel,
		myVote,
		outcomeName,
		tallyOf,
		voteFromName,
		voteName,
		withdrawnVote
	} from '$lib/utils/dispute.utils';
	import { formatTokenAmount, nsToDate, shortPrincipal } from '$lib/utils/format.utils';

	let dealId = $derived(parseDealId(page.params.deal_id ?? ''));

	let deal: Deal | undefined = $state(undefined);
	let dispute: Dispute | undefined = $state(undefined);
	let loading = $state(false);
	let progress = $state(false);
	let error: string | undefined = $state(undefined);

	let evidenceNote = $state('');
	let evidenceUrl = $state('');
	let evidenceHash = $state('');
	let withdrawProposal: VoteName | undefined = $state(undefined);
	let voteChoice: VoteName | undefined = $state(undefined);

	let nowNs = $state(BigInt(Date.now()) * 1_000_000n);
	$effect(() => {
		const id = window.setInterval(() => {
			nowNs = BigInt(Date.now()) * 1_000_000n;
		}, 30_000);

		return () => window.clearInterval(id);
	});

	let principal = $derived(parsePrincipal($userPrincipalText));
	let mySide: DealSide = $derived(deal !== undefined ? sideOf(deal, principal) : 'unknown');
	let phase = $derived(dispute === undefined ? undefined : disputePhase(dispute));
	let onPanel = $derived(dispute !== undefined && isOnPanel(dispute, principal));
	let myCastVote = $derived(dispute === undefined ? undefined : myVote(dispute, principal));

	let evidenceOpen = $derived.by(() => {
		if (dispute === undefined) {
			return false;
		}
		if (phase !== DisputePhases.Evidence) {
			return false;
		}
		return nowNs < dispute.evidence_deadline_ns;
	});
	let votingOpen = $derived.by(() => {
		if (dispute === undefined) {
			return false;
		}
		// The canister lazily advances Evidence → Voting on the first
		// vote past the evidence deadline; mirror that here so the
		// cast-vote UI shows up as soon as the wall-clock crosses
		// `evidence_deadline_ns` even if `phase` is still `Evidence`.
		const phaseOk = phase === DisputePhases.Evidence || phase === DisputePhases.Voting;
		if (!phaseOk) {
			return false;
		}
		return nowNs >= dispute.evidence_deadline_ns && nowNs < dispute.voting_deadline_ns;
	});
	let canFinalize = $derived.by(() => {
		if (dispute === undefined) {
			return false;
		}
		if (phase === DisputePhases.Resolved) {
			return false;
		}
		return nowNs >= dispute.voting_deadline_ns;
	});

	const reload = async () => {
		if (dealId === undefined) {
			error = $i18n.dispute.deal_not_found;
			return;
		}

		loading = true;
		error = undefined;

		try {
			const fetched = await getDeal({ dealId });
			deal = fetched;
			dealsStore.upsert(fetched);

			const id = fromNullable(fetched.dispute);
			if (id !== undefined) {
				const d = await getDispute({ disputeId: id });
				dispute = d;
				disputesStore.upsert(d);
			} else {
				dispute = undefined;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			console.error('load dispute failed:', err);
		} finally {
			loading = false;
		}
	};

	$effect(() => {
		reload();
	});

	const wrap = async (op: string, action: () => Promise<Dispute>) => {
		progress = true;
		error = undefined;

		try {
			const updated = await action();
			dispute = updated;
			disputesStore.upsert(updated);

			// `open_dispute` / `withdraw_dispute(complete)` mutate the
			// parent deal too — pull a fresh `DealView` so the deal store
			// (and any other open page) sees `Disputed` /
			// `ArbitratedSettled` / `ArbitratedRefunded`.
			if (dealId !== undefined) {
				const refreshed = await getDeal({ dealId });
				deal = refreshed;
				dealsStore.upsert(refreshed);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			console.error(`${op} failed:`, err);
		} finally {
			progress = false;
		}
	};

	const onOpenDispute = () => {
		if (dealId === undefined) {
			return;
		}
		const id = dealId;
		wrap('openDispute', () => openDispute({ dealId: id }));
	};

	const onSubmitEvidence = () => {
		if (dispute === undefined) {
			return;
		}
		const note = evidenceNote.trim();
		const url = evidenceUrl.trim();
		const hashHex = evidenceHash.trim();

		if (note.length === 0 && url.length === 0) {
			error = $i18n.dispute.evidence_required;
			return;
		}
		if (url.length > 0 && hashHex.length === 0) {
			error = $i18n.dispute.evidence_hash_required;
			return;
		}

		const hashBytes = hashHex.length === 0 ? undefined : parseHashHex(hashHex);
		if (hashHex.length > 0 && hashBytes === undefined) {
			error = $i18n.dispute.evidence_hash_invalid;
			return;
		}

		const id = dispute.id;
		wrap('submitEvidence', () =>
			submitEvidence({
				disputeId: id,
				note: note.length === 0 ? undefined : note,
				artefactUrl: url.length === 0 ? undefined : url,
				artefactSha256: hashBytes
			})
		).then(() => {
			evidenceNote = '';
			evidenceUrl = '';
			evidenceHash = '';
		});
	};

	const onWithdraw = () => {
		if (dispute === undefined || withdrawProposal === undefined) {
			return;
		}
		const id = dispute.id;
		const proposal = voteFromName(withdrawProposal);
		wrap('withdrawDispute', () => withdrawDispute({ disputeId: id, proposal }));
	};

	const onRetractWithdraw = () => {
		if (dispute === undefined) {
			return;
		}
		const id = dispute.id;
		wrap('withdrawDispute', () => withdrawDispute({ disputeId: id, proposal: undefined })).then(
			() => {
				withdrawProposal = undefined;
			}
		);
	};

	const onCastVote = () => {
		if (dispute === undefined || voteChoice === undefined) {
			return;
		}
		const id = dispute.id;
		const vote = voteFromName(voteChoice);
		wrap('castVote', () => castVote({ disputeId: id, vote }));
	};

	const onFinalize = () => {
		if (dispute === undefined) {
			return;
		}
		const id = dispute.id;
		wrap('finalizeDispute', () => finalizeDispute({ disputeId: id }));
	};

	const back = () => goto(`/deals/${dealId ?? ''}`);

	function parseDealId(text: string): bigint | undefined {
		try {
			return BigInt(text);
		} catch {
			return undefined;
		}
	}

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

	/**
	 * Decode a hex-encoded 32-byte SHA-256 digest. Returns `undefined`
	 * for any input that isn't exactly 64 hex chars.
	 */
	function parseHashHex(hex: string): Uint8Array | undefined {
		const normalized = hex.replace(/^0x/i, '').trim();
		if (normalized.length !== 64 || !/^[0-9a-fA-F]+$/.test(normalized)) {
			return undefined;
		}
		const bytes = new Uint8Array(32);
		for (let i = 0; i < 32; i++) {
			bytes[i] = parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
		}
		return bytes;
	}

	let myWithdraw = $derived.by(() => {
		if (dispute === undefined || mySide === 'unknown') {
			return undefined;
		}
		return fromNullable(
			mySide === 'payer' ? dispute.payer_withdraw_proposal : dispute.recipient_withdraw_proposal
		);
	});
	let counterpartyWithdraw = $derived.by(() => {
		if (dispute === undefined || mySide === 'unknown') {
			return undefined;
		}
		return fromNullable(
			mySide === 'payer' ? dispute.recipient_withdraw_proposal : dispute.payer_withdraw_proposal
		);
	});

	let outcome = $derived.by(() => {
		if (dispute === undefined) {
			return undefined;
		}
		return fromNullable(dispute.outcome);
	});
	let tally = $derived.by(() => (outcome === undefined ? undefined : tallyOf(outcome)));
	let withdrawnAgreed = $derived.by(() =>
		outcome === undefined ? undefined : withdrawnVote(outcome)
	);
</script>

<svelte:head>
	<title>{$i18n.dispute.title} · {$i18n.layout.title}</title>
</svelte:head>

<AuthGuard />

<BrandHeader title={$i18n.dispute.title}>
	{#snippet leading()}
		<IconButton ariaLabel={$i18n.dispute.cancel_cta} variant="ghost" onclick={back}>
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
		{#if dispute !== undefined && phase !== undefined}
			<DisputePhaseBadge {phase} />
		{/if}
	{/snippet}
</BrandHeader>

<section class="flex flex-1 flex-col gap-5 px-6 pt-6 pb-28">
	{#if loading && deal === undefined}
		<p class="text-body2 text-muted" aria-live="polite">{$i18n.dispute.loading}</p>
	{:else if deal === undefined}
		<p class="border-danger bg-danger/10 text-body2 text-danger rounded-md border p-3" role="alert">
			{error ?? $i18n.dispute.deal_not_found}
		</p>
	{:else if dispute === undefined}
		<!-- No dispute attached yet — open-dispute CTA. -->
		<p class="text-body1 text-default">{$i18n.dispute.intro}</p>

		<div class="border-warning/40 bg-warning/10 flex flex-col gap-2 rounded-md border p-4">
			<h2 class="text-body1 text-default font-bold">{$i18n.dispute.open_warning_title}</h2>
			<p class="text-body2 text-default">{$i18n.dispute.open_warning_body}</p>
		</div>

		<div class="mt-auto flex gap-3">
			<Button variant="ghost" fullWidth onclick={back}>{$i18n.dispute.cancel_cta}</Button>
			<Button fullWidth onclick={onOpenDispute} disabled={progress}>
				{$i18n.dispute.open_cta}
			</Button>
		</div>
	{:else}
		<!-- ── Top summary ───────────────────────────────────────────────── -->
		<div class="border-border-soft bg-bg-elevated flex flex-col gap-2 rounded-md border p-4">
			<div class="flex items-baseline justify-between">
				<dt class="text-body2 text-muted">{$i18n.dispute.field_id}</dt>
				<dd class="text-body2 text-default font-mono">#{dispute.id.toString()}</dd>
			</div>
			<div class="flex items-baseline justify-between">
				<dt class="text-body2 text-muted">{$i18n.dispute.field_panel_size}</dt>
				<dd class="text-body2 text-default">{dispute.panel.length}</dd>
			</div>
			<div class="flex items-baseline justify-between">
				<dt class="text-body2 text-muted">{$i18n.dispute.field_arbitration_fee}</dt>
				<dd class="text-body2 text-default">
					{formatTokenAmount(dispute.arbitration_fee, ICP_TOKEN)}
				</dd>
			</div>
			<div class="flex items-baseline justify-between">
				<dt class="text-body2 text-muted">{$i18n.dispute.field_evidence_deadline}</dt>
				<dd class="text-body2 text-default">
					<Countdown expiresAtNs={dispute.evidence_deadline_ns} />
				</dd>
			</div>
			<div class="flex items-baseline justify-between">
				<dt class="text-body2 text-muted">{$i18n.dispute.field_voting_deadline}</dt>
				<dd class="text-body2 text-default">
					<Countdown expiresAtNs={dispute.voting_deadline_ns} />
				</dd>
			</div>
			<div class="flex items-baseline justify-between">
				<dt class="text-body2 text-muted">{$i18n.dispute.field_opened_by}</dt>
				<dd class="text-body2 text-default font-mono">
					{shortPrincipal(dispute.opened_by)}
				</dd>
			</div>
		</div>

		<!-- ── Resolved outcome ──────────────────────────────────────────── -->
		{#if phase === DisputePhases.Resolved && outcome !== undefined}
			<div
				class="border-border-soft bg-bg-elevated flex flex-col gap-3 rounded-md border p-4"
				role="status"
			>
				<h2 class="text-body1 text-default font-bold">
					{$i18n.dispute.resolved_title}
				</h2>
				<p class="text-body2 text-default">
					{#if outcomeName(outcome) === 'Settled'}
						{$i18n.dispute.outcome_settled}
					{:else if outcomeName(outcome) === 'Refunded'}
						{$i18n.dispute.outcome_refunded}
					{:else if outcomeName(outcome) === 'NoQuorum'}
						{$i18n.dispute.outcome_no_quorum}
					{:else if withdrawnAgreed !== undefined && voteName(withdrawnAgreed) === 'ConcludedCorrectly'}
						{$i18n.dispute.outcome_withdrawn_settled}
					{:else}
						{$i18n.dispute.outcome_withdrawn_refunded}
					{/if}
				</p>
				{#if tally !== undefined}
					<dl
						class="text-default grid grid-cols-3 gap-2 font-sans text-[14px] font-medium tracking-[-0.28px]"
					>
						<div class="flex flex-col items-center">
							<dt class="text-muted text-body2">{$i18n.dispute.tally_cc}</dt>
							<dd class="text-h6 font-bold">{tally.cc}</dd>
						</div>
						<div class="flex flex-col items-center">
							<dt class="text-muted text-body2">{$i18n.dispute.tally_ic}</dt>
							<dd class="text-h6 font-bold">{tally.ic}</dd>
						</div>
						<div class="flex flex-col items-center">
							<dt class="text-muted text-body2">{$i18n.dispute.tally_abstain}</dt>
							<dd class="text-h6 font-bold">{tally.abstain}</dd>
						</div>
					</dl>
				{/if}
			</div>
		{/if}

		<!-- ── Withdraw / out-of-band proposals (parties only, evidence
		     phase only) ────────────────────────────────────────────────── -->
		{#if mySide !== 'unknown' && phase === DisputePhases.Evidence && evidenceOpen}
			<div class="border-border-soft bg-bg-elevated flex flex-col gap-3 rounded-md border p-4">
				<h2 class="text-body1 text-default font-bold">{$i18n.dispute.withdraw_title}</h2>
				<p class="text-body2 text-muted">{$i18n.dispute.withdraw_description}</p>

				<dl class="grid grid-cols-2 gap-2">
					<div class="flex flex-col">
						<dt class="text-muted text-body2">{$i18n.dispute.withdraw_my_proposal}</dt>
						<dd class="text-default text-body2 font-bold">
							{myWithdraw === undefined ? $i18n.dispute.withdraw_none : voteName(myWithdraw)}
						</dd>
					</div>
					<div class="flex flex-col">
						<dt class="text-muted text-body2">{$i18n.dispute.withdraw_their_proposal}</dt>
						<dd class="text-default text-body2 font-bold">
							{counterpartyWithdraw === undefined
								? $i18n.dispute.withdraw_none
								: voteName(counterpartyWithdraw)}
						</dd>
					</div>
				</dl>

				<VotePicker bind:value={withdrawProposal} excludeAbstain ariaLabel="Withdraw proposal" />

				<div class="flex flex-wrap items-center gap-2">
					<Button onclick={onWithdraw} disabled={progress || withdrawProposal === undefined}>
						{$i18n.dispute.withdraw_propose_cta}
					</Button>
					{#if myWithdraw !== undefined}
						<Button variant="ghost" onclick={onRetractWithdraw} disabled={progress}>
							{$i18n.dispute.withdraw_retract_cta}
						</Button>
					{/if}
				</div>
			</div>
		{/if}

		<!-- ── Cast vote (panel arbitrators, voting window only) ─────────── -->
		{#if onPanel && votingOpen}
			<div class="border-border-soft bg-bg-elevated flex flex-col gap-3 rounded-md border p-4">
				<h2 class="text-body1 text-default font-bold">{$i18n.dispute.vote_title}</h2>
				<p class="text-body2 text-muted">{$i18n.dispute.vote_description}</p>

				{#if myCastVote !== undefined}
					<p class="text-body2 text-default">
						{$i18n.dispute.vote_current_label}
						<strong>{voteName(myCastVote)}</strong>
					</p>
				{/if}

				<VotePicker bind:value={voteChoice} ariaLabel="Cast vote" />

				<Button onclick={onCastVote} disabled={progress || voteChoice === undefined}>
					{myCastVote === undefined ? $i18n.dispute.vote_cast_cta : $i18n.dispute.vote_change_cta}
				</Button>
			</div>
		{/if}

		<!-- ── Finalize (anyone, after voting deadline) ──────────────────── -->
		{#if canFinalize}
			<div class="border-border-soft bg-bg-elevated flex flex-col gap-3 rounded-md border p-4">
				<h2 class="text-body1 text-default font-bold">{$i18n.dispute.finalize_title}</h2>
				<p class="text-body2 text-muted">{$i18n.dispute.finalize_description}</p>
				<Button onclick={onFinalize} disabled={progress}>
					{$i18n.dispute.finalize_cta}
				</Button>
			</div>
		{/if}

		<!-- ── Evidence list + add form ──────────────────────────────────── -->
		<div class="flex flex-col gap-3">
			<h2 class="text-body1 text-default font-bold">
				{$i18n.dispute.evidence_section_title} ({dispute.evidence.length})
			</h2>
			<EvidenceList items={dispute.evidence} />

			{#if evidenceOpen && (mySide !== 'unknown' || onPanel)}
				<EvidenceForm
					bind:note={evidenceNote}
					bind:url={evidenceUrl}
					bind:hash={evidenceHash}
					{progress}
					onsubmit={onSubmitEvidence}
				/>
			{/if}
		</div>

		<!-- ── Panel summary ─────────────────────────────────────────────── -->
		<div class="border-border-soft bg-bg-elevated flex flex-col gap-2 rounded-md border p-4">
			<h2 class="text-body1 text-default font-bold">{$i18n.dispute.panel_title}</h2>
			<ul class="flex flex-col gap-2">
				{#each dispute.panel as member, idx (member.principal.toText())}
					{@const memberVote = fromNullable(member.vote)}
					{@const paidAt = fromNullable(member.paid_at_ns)}
					<li class="text-body2 text-default flex items-center justify-between">
						<span class="font-mono">{idx + 1}. {shortPrincipal(member.principal)}</span>
						<span class="text-muted">
							{#if memberVote !== undefined}
								{voteName(memberVote)}
							{:else if phase === DisputePhases.Resolved}
								{$i18n.dispute.panel_no_vote}
							{:else}
								{$i18n.dispute.panel_pending}
							{/if}
							{#if paidAt !== undefined}
								·
								<time datetime={nsToDate(paidAt).toISOString()}>{$i18n.dispute.panel_paid}</time>
							{/if}
						</span>
					</li>
				{/each}
			</ul>
		</div>

		{#if error !== undefined}
			<p
				class="border-danger bg-danger/10 text-body2 text-danger rounded-md border p-2"
				role="alert"
			>
				{error}
			</p>
		{/if}

		<div class="mt-auto">
			<Button variant="ghost" fullWidth onclick={back}>{$i18n.dispute.back_to_deal}</Button>
		</div>
	{/if}
</section>

<AppBottomNav />

{#if progress}
	<Backdrop spinner />
{/if}
