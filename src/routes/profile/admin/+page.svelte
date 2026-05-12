<script lang="ts">
	import { Principal } from '@icp-sdk/core/principal';
	import { goto } from '$app/navigation';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import Backdrop from '$lib/components/Backdrop.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import Button from '$lib/components/Button.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import Sheet from '$lib/components/Sheet.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import UserPrincipalBadge from '$lib/components/UserPrincipalBadge.svelte';
	import { ArbitratorStatuses, type ArbitratorStatusName } from '$lib/enums/arbitrator';
	import {
		adminRegisterArbitrator,
		adminSetArbitratorStatus,
		listArbitrators
	} from '$lib/services/arbitrator.services';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Arbitrator } from '$lib/types/arbitrator';
	import { arbitratorScore, arbitratorStatus, statusFromName } from '$lib/utils/arbitrator.utils';
	import { nsToDate, shortPrincipal } from '$lib/utils/format.utils';

	let arbitrators: Arbitrator[] = $state([]);
	let loading = $state(false);
	let progress = $state(false);
	let error: string | undefined = $state(undefined);
	let registerInput = $state('');

	const STATUS_ORDER: readonly ArbitratorStatusName[] = [
		ArbitratorStatuses.Active,
		ArbitratorStatuses.Suspended,
		ArbitratorStatuses.Deregistered
	];

	const reload = async () => {
		loading = true;
		error = undefined;
		try {
			const list = await listArbitrators({ limit: 100n });
			arbitrators = list;
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			console.error('Failed to load arbitrators:', err);
		} finally {
			loading = false;
		}
	};

	$effect(() => {
		reload();
	});

	const onRegister = async () => {
		const text = registerInput.trim();
		if (text.length === 0) {
			return;
		}

		let principal: Principal;
		try {
			principal = Principal.fromText(text);
		} catch {
			error = $i18n.admin.invalid_principal;
			return;
		}

		progress = true;
		error = undefined;

		try {
			await adminRegisterArbitrator({ principal });
			registerInput = '';
			await reload();
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			console.error('Failed to register arbitrator:', err);
		} finally {
			progress = false;
		}
	};

	const onChangeStatus = (arbitrator: Arbitrator, next: ArbitratorStatusName) => async () => {
		progress = true;
		error = undefined;

		try {
			await adminSetArbitratorStatus({
				principal: arbitrator.principal,
				status: statusFromName(next)
			});
			await reload();
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			console.error('Failed to set arbitrator status:', err);
		} finally {
			progress = false;
		}
	};

	const back = () => goto('/profile');

	const statusBadgeClass = (s: ArbitratorStatusName): string => {
		switch (s) {
			case ArbitratorStatuses.Active:
				return 'bg-success/15 text-success';
			case ArbitratorStatuses.Suspended:
				return 'bg-warning/15 text-warning';
			case ArbitratorStatuses.Deregistered:
				return 'bg-muted/15 text-muted';
		}
	};
</script>

<svelte:head>
	<title>{$i18n.admin.title} · {$i18n.layout.title}</title>
</svelte:head>

<AuthGuard />

<BrandHeader title={$i18n.admin.title} subtitle={$i18n.admin.subtitle}>
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
	<div
		class="border-warning/40 bg-warning/10 text-body2 text-default rounded-md border p-3"
		role="note"
	>
		{$i18n.admin.controller_warning}
	</div>

	<form
		class="border-border-soft bg-bg-elevated flex flex-col gap-3 rounded-md border p-4"
		onsubmit={(e) => {
			e.preventDefault();
			onRegister();
		}}
	>
		<h2 class="text-h6 text-default font-bold">{$i18n.admin.register_section}</h2>
		<p class="text-body2 text-muted">{$i18n.admin.register_description}</p>
		<FormField label={$i18n.admin.register_label} htmlFor="register-principal">
			<TextInput id="register-principal" bind:value={registerInput} placeholder="aaaaa-bb…-cc" />
		</FormField>
		<Button type="submit" disabled={progress || registerInput.trim().length === 0}>
			{$i18n.admin.register_cta}
		</Button>
	</form>

	<section class="flex flex-col gap-3">
		<h2 class="text-h6 text-default font-bold">
			{$i18n.admin.list_section} ({arbitrators.length})
		</h2>

		{#if loading && arbitrators.length === 0}
			<p class="text-body2 text-muted" aria-live="polite">{$i18n.core.text.loading}</p>
		{:else if arbitrators.length === 0}
			<EmptyState
				title={$i18n.admin.list_empty_title}
				description={$i18n.admin.list_empty_description}
			/>
		{:else}
			<ul class="flex flex-col gap-3">
				{#each arbitrators as arbitrator (arbitrator.principal.toText())}
					{@const s = arbitratorStatus(arbitrator)}
					{@const score = arbitratorScore(arbitrator)}
					<li class="border-border-soft bg-bg-elevated flex flex-col gap-2 rounded-md border p-3">
						<header class="flex items-center justify-between gap-3">
							<span class="text-body2 text-default font-mono break-all">
								{shortPrincipal(arbitrator.principal)}
							</span>
							<span
								class="rounded-full px-3 py-1 font-sans text-[10px] font-semibold tracking-[0.4px] capitalize {statusBadgeClass(
									s
								)}"
							>
								{s}
							</span>
						</header>
						<dl
							class="text-body2 text-default grid grid-cols-2 gap-x-2 gap-y-1 font-sans tracking-[-0.28px]"
						>
							<dt class="text-muted">{$i18n.arbitrator.field_assigned}</dt>
							<dd class="text-right">{arbitrator.disputes_assigned}</dd>
							<dt class="text-muted">{$i18n.arbitrator.field_voted}</dt>
							<dd class="text-right">{arbitrator.disputes_voted}</dd>
							<dt class="text-muted">{$i18n.arbitrator.field_with_majority}</dt>
							<dd class="text-right">{arbitrator.disputes_with_majority}</dd>
							<dt class="text-muted">{$i18n.arbitrator.field_score}</dt>
							<dd class="text-right">
								{score === undefined ? $i18n.arbitrator.score_not_yet : `${score}/100`}
							</dd>
							<dt class="text-muted">{$i18n.arbitrator.field_registered_at}</dt>
							<dd class="text-right">
								{nsToDate(arbitrator.registered_at_ns).toLocaleDateString()}
							</dd>
						</dl>
						<div class="flex flex-wrap gap-2">
							{#each STATUS_ORDER as next (next)}
								<button
									type="button"
									onclick={onChangeStatus(arbitrator, next)}
									disabled={progress || s === next}
									class="border-border-soft text-default text-body2 rounded-md border px-3 py-1 font-medium capitalize transition-colors {s ===
									next
										? 'bg-primary/10 border-primary-stroke text-primary-stroke cursor-not-allowed'
										: 'hover:border-primary-stroke/60'} {progress ? 'cursor-wait opacity-60' : ''}"
								>
									{next}
								</button>
							{/each}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	{#if error !== undefined}
		<p class="border-danger bg-danger/10 text-body2 text-danger rounded-md border p-2" role="alert">
			{error}
		</p>
	{/if}
</Sheet>

<AppBottomNav />

{#if progress}
	<Backdrop spinner />
{/if}
