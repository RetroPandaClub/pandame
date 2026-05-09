<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import Button from '$lib/components/Button.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import VoteQuorumPicker, { type Quorum } from '$lib/components/VoteQuorumPicker.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	let dealId = $derived(page.params.deal_id ?? '');
	let quorum: Quorum = $state('fair');
	let reason = $state('');

	const back = () => goto(`/deals/${dealId}`);
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
</BrandHeader>

<section class="flex flex-1 flex-col gap-5 px-6 pt-6 pb-28">
	<div
		class="border-warning/40 bg-warning/10 flex flex-col gap-2 rounded-md border p-4"
		role="note"
	>
		<h2 class="text-body1 text-default font-bold">{$i18n.dispute.stub_banner_title}</h2>
		<p class="text-body2 text-default">{$i18n.dispute.stub_banner_description}</p>
	</div>

	<p class="text-body1 text-default">{$i18n.dispute.intro}</p>

	<FormField
		label={$i18n.dispute.reason_label}
		htmlFor="dispute-reason"
		hint={$i18n.deals.actions.dispute_tooltip}
	>
		<textarea
			id="dispute-reason"
			bind:value={reason}
			placeholder={$i18n.dispute.reason_placeholder}
			rows={4}
			disabled
			class="border-border bg-bg-elevated text-body1 text-default placeholder:text-subtle focus:border-primary focus:ring-primary/30 w-full resize-none rounded-md border px-4 py-3 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
		></textarea>
	</FormField>

	<div class="flex flex-col gap-3">
		<span class="text-body2 text-default font-bold">{$i18n.dispute.evidence_label}</span>
		<label
			class="border-border-soft text-body2 text-muted flex flex-col items-center gap-1 rounded-md border-2 border-dashed p-6 text-center"
		>
			<svg
				viewBox="0 0 24 24"
				class="text-primary/60 h-8 w-8"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M12 19V5m-7 7l7-7 7 7" />
			</svg>
			<span>{$i18n.dispute.evidence_label}</span>
			<small>{$i18n.dispute.evidence_hint}</small>
			<input type="file" disabled class="sr-only" />
		</label>
	</div>

	<div class="flex flex-col gap-3">
		<span class="text-body2 text-default font-bold">{$i18n.dispute.votes_label}</span>
		<VoteQuorumPicker bind:value={quorum} disabled />
	</div>

	<div class="mt-auto flex gap-3">
		<Button variant="ghost" fullWidth onclick={back}>{$i18n.dispute.cancel_cta}</Button>
		<Button fullWidth disabled>{$i18n.dispute.open_cta}</Button>
	</div>
</section>

<AppBottomNav />
