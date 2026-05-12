<script lang="ts">
	import { Principal } from '@icp-sdk/core/principal';
	import { goto } from '$app/navigation';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import Backdrop from '$lib/components/Backdrop.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import Button from '$lib/components/Button.svelte';
	import DisputeCard from '$lib/components/DisputeCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import Sheet from '$lib/components/Sheet.svelte';
	import UserPrincipalBadge from '$lib/components/UserPrincipalBadge.svelte';
	import { userPrincipalText } from '$lib/derived/user.derived';
	import { ArbitratorStatuses } from '$lib/enums/arbitrator';
	import { deregisterArbitrator, ensureArbitrator } from '$lib/services/arbitrator.services';
	import { listMyDisputes } from '$lib/services/dispute.services';
	import { arbitratorStore } from '$lib/stores/arbitrator.store';
	import { disputesStore } from '$lib/stores/disputes.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Arbitrator } from '$lib/types/arbitrator';
	import type { Dispute } from '$lib/types/dispute';
	import { arbitratorScore, arbitratorStatus } from '$lib/utils/arbitrator.utils';
	import { isOnPanel } from '$lib/utils/dispute.utils';
	import { nsToDate, shortPrincipal } from '$lib/utils/format.utils';

	let progress = $state(false);
	let error: string | undefined = $state(undefined);

	let arbitrator: Arbitrator | null | undefined = $derived($arbitratorStore);

	let principal = $derived.by(() => {
		const text = $userPrincipalText;
		if (text === undefined || text.length === 0) {
			return undefined;
		}
		try {
			return Principal.fromText(text);
		} catch {
			return undefined;
		}
	});

	let assignedDisputes = $derived.by((): Dispute[] => {
		const all = $disputesStore;
		if (all === undefined || principal === undefined) {
			return [];
		}
		return all.filter((d) => isOnPanel(d, principal));
	});

	let status = $derived(
		arbitrator === null || arbitrator === undefined ? undefined : arbitratorStatus(arbitrator)
	);
	let score = $derived(
		arbitrator === null || arbitrator === undefined ? undefined : arbitratorScore(arbitrator)
	);
	let registeredAt = $derived(
		arbitrator === null || arbitrator === undefined
			? undefined
			: nsToDate(arbitrator.registered_at_ns)
	);

	const reload = async () => {
		const p = principal;
		if (p === undefined) {
			return;
		}

		try {
			await ensureArbitrator({ principal: p });
		} catch (err) {
			console.error('Failed to refresh arbitrator profile:', err);
		}

		try {
			const disputes = await listMyDisputes();
			disputesStore.set(disputes);
		} catch (err) {
			console.error('Failed to refresh disputes:', err);
		}
	};

	$effect(() => {
		reload();
	});

	const onDeregister = async () => {
		if (!window.confirm($i18n.arbitrator.deregister_confirm)) {
			return;
		}

		progress = true;
		error = undefined;

		try {
			const updated = await deregisterArbitrator();
			arbitratorStore.set(updated);
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			console.error('Failed to deregister:', err);
		} finally {
			progress = false;
		}
	};

	const back = () => goto('/profile');
</script>

<svelte:head>
	<title>{$i18n.arbitrator.title} · {$i18n.layout.title}</title>
</svelte:head>

<AuthGuard />

<BrandHeader title={$i18n.arbitrator.title} subtitle={$i18n.arbitrator.subtitle} tone="success">
	{#snippet leading()}
		<IconButton ariaLabel={$i18n.core.text.back_to_dashboard} variant="ghost" onclick={back}>
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
		<UserPrincipalBadge />
	{/snippet}
</BrandHeader>

<Sheet paddingClass="px-[19px] pt-[26px] pb-[120px]" class="gap-[20px]">
	{#if arbitrator === undefined}
		<p class="text-body2 text-muted" aria-live="polite">{$i18n.arbitrator.loading}</p>
	{:else if arbitrator === null}
		<EmptyState
			title={$i18n.arbitrator.not_registered_title}
			description={$i18n.arbitrator.not_registered_description}
		/>
	{:else}
		<div class="border-border-soft bg-bg-elevated flex flex-col gap-3 rounded-md border p-4">
			<h2 class="text-h6 text-default font-bold">{$i18n.arbitrator.profile_section}</h2>
			<dl class="text-body2 text-default flex flex-col gap-2">
				<div class="flex items-baseline justify-between">
					<dt class="text-muted">{$i18n.arbitrator.field_principal}</dt>
					<dd class="font-mono">{shortPrincipal(arbitrator.principal)}</dd>
				</div>
				<div class="flex items-baseline justify-between">
					<dt class="text-muted">{$i18n.arbitrator.field_status}</dt>
					<dd class="capitalize">
						{#if status === ArbitratorStatuses.Active}
							<span class="text-success font-bold">{$i18n.arbitrator.status_active}</span>
						{:else if status === ArbitratorStatuses.Suspended}
							<span class="text-warning font-bold">{$i18n.arbitrator.status_suspended}</span>
						{:else}
							<span class="text-muted font-bold">{$i18n.arbitrator.status_deregistered}</span>
						{/if}
					</dd>
				</div>
				<div class="flex items-baseline justify-between">
					<dt class="text-muted">{$i18n.arbitrator.field_registered_at}</dt>
					<dd>{registeredAt?.toLocaleDateString() ?? ''}</dd>
				</div>
				<div class="flex items-baseline justify-between">
					<dt class="text-muted">{$i18n.arbitrator.field_assigned}</dt>
					<dd>{arbitrator.disputes_assigned}</dd>
				</div>
				<div class="flex items-baseline justify-between">
					<dt class="text-muted">{$i18n.arbitrator.field_voted}</dt>
					<dd>{arbitrator.disputes_voted}</dd>
				</div>
				<div class="flex items-baseline justify-between">
					<dt class="text-muted">{$i18n.arbitrator.field_with_majority}</dt>
					<dd>{arbitrator.disputes_with_majority}</dd>
				</div>
				<div class="flex items-baseline justify-between">
					<dt class="text-muted">{$i18n.arbitrator.field_score}</dt>
					<dd>
						{score === undefined ? $i18n.arbitrator.score_not_yet : `${score}/100`}
					</dd>
				</div>
				<div class="flex items-baseline justify-between">
					<dt class="text-muted">{$i18n.arbitrator.field_registered_by}</dt>
					<dd class="font-mono">{shortPrincipal(arbitrator.registered_by)}</dd>
				</div>
			</dl>
		</div>

		<div class="flex flex-col gap-3">
			<h2 class="text-h6 text-default font-bold">
				{$i18n.arbitrator.assigned_section} ({assignedDisputes.length})
			</h2>
			{#if assignedDisputes.length === 0}
				<EmptyState
					title={$i18n.arbitrator.assigned_empty_title}
					description={$i18n.arbitrator.assigned_empty_description}
				/>
			{:else}
				<ul class="flex flex-col gap-3">
					{#each assignedDisputes as dispute (dispute.id)}
						<li>
							<DisputeCard {dispute} href={`/deals/${dispute.deal_id}/dispute`} />
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		{#if status === ArbitratorStatuses.Active || status === ArbitratorStatuses.Suspended}
			<Button variant="ghost" onclick={onDeregister} disabled={progress}>
				{$i18n.arbitrator.deregister_cta}
			</Button>
		{/if}

		{#if error !== undefined}
			<p
				class="border-danger bg-danger/10 text-body2 text-danger rounded-md border p-2"
				role="alert"
			>
				{error}
			</p>
		{/if}
	{/if}
</Sheet>

<AppBottomNav />

{#if progress}
	<Backdrop spinner />
{/if}
