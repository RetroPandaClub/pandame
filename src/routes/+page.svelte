<script lang="ts">
	import { goto } from '$app/navigation';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import ChatBubble from '$lib/components/ChatBubble.svelte';
	import ChatChoiceRow from '$lib/components/ChatChoiceRow.svelte';
	import InfoLink from '$lib/components/InfoLink.svelte';
	import Sheet from '$lib/components/Sheet.svelte';
	import UserPrincipalBadge from '$lib/components/UserPrincipalBadge.svelte';
	import WelcomeScreen from '$lib/components/WelcomeScreen.svelte';
	import { userSignedIn } from '$lib/derived/user.derived';
	import { i18n } from '$lib/stores/i18n.store';

	type Mode = 'pay' | 'receive';
	type Path = 'guided' | 'expert';
	type HistoryFilter = 'all' | 'active' | 'settled' | 'refunded';

	// The chatbot is a single decision tree with two branches: Create
	// (multi-step wizard ending in `/deals/new`) and History (one-step
	// filter pick ending in `/history?filter=…`). Each branch is gated
	// by a separate `intent…` flag so the two are mutually exclusive
	// and the user can't end up in a half-finished state.
	let intentCreate = $state(false);
	let intentHistory = $state(false);
	let mode: Mode | undefined = $state(undefined);
	let path: Path | undefined = $state(undefined);
	let historyFilter: HistoryFilter | undefined = $state(undefined);

	// Header chip text mirrors the chatbot's current branch — Figma
	// frames flip "Hello!" → "New Deal" the moment the user commits
	// to a branch. The history branch follows the same pattern.
	let headerChip = $derived.by(() => {
		if (intentCreate) {
			return $i18n.home.chip_new_deal;
		}
		if (intentHistory) {
			return $i18n.home.chip_your_deals;
		}
		return $i18n.home.chip_hello;
	});

	const startCreate = () => {
		intentCreate = true;
		intentHistory = false;
	};
	const startHistory = () => {
		intentHistory = true;
		intentCreate = false;
	};
	const choosePay = () => {
		mode = 'pay';
	};
	const chooseReceive = () => {
		mode = 'receive';
	};
	const chooseGuided = async () => {
		path = 'guided';
		await goto(mode === 'receive' ? '/deals/new?side=receive' : '/deals/new');
	};
	const chooseExpert = async () => {
		path = 'expert';
		await goto(
			mode === 'receive' ? '/deals/new?side=receive&mode=expert' : '/deals/new?mode=expert'
		);
	};
	const chooseFilter = (next: HistoryFilter) => async () => {
		historyFilter = next;
		await goto(`/history?filter=${next}`);
	};
</script>

{#if !$userSignedIn}
	<WelcomeScreen />
{:else}
	<BrandHeader title={$i18n.home.title}>
		{#snippet trailing()}
			<UserPrincipalBadge />
		{/snippet}

		<span
			class="text-default-inverse border-shape-primary/67 flex h-[36px] items-center justify-center rounded-[55px] border bg-transparent px-[24px] font-sans text-[16px] leading-[24px] font-normal"
		>
			{headerChip}
		</span>
	</BrandHeader>

	<Sheet paddingClass="px-[19px] pt-[28px] pb-[24px]" class="gap-[20px]">
		<ChatBubble side="bot">
			<span
				>{$i18n.home.bot_greeting_prefix}<span class="font-medium"
					>{$i18n.home.bot_greeting_brand}</span
				>{$i18n.home.bot_greeting_suffix}</span
			>
		</ChatBubble>

		<ChatChoiceRow
			choices={[
				{
					id: 'create',
					label: $i18n.home.choice_create,
					variant: intentCreate ? 'primary' : 'secondary',
					onclick: startCreate
				},
				{
					id: 'history',
					label: $i18n.home.choice_history,
					variant: intentHistory ? 'primary' : 'secondary',
					onclick: startHistory
				}
			]}
		/>

		{#if intentHistory}
			<ChatBubble side="bot">
				{$i18n.home.bot_history_filter}
			</ChatBubble>

			<ChatChoiceRow
				scroll
				choices={[
					{
						id: 'filter-all',
						label: $i18n.home.choice_filter_all,
						variant: historyFilter === 'all' ? 'primary' : 'secondary',
						onclick: chooseFilter('all')
					},
					{
						id: 'filter-active',
						label: $i18n.home.choice_filter_active,
						variant: historyFilter === 'active' ? 'primary' : 'secondary',
						onclick: chooseFilter('active')
					},
					{
						id: 'filter-settled',
						label: $i18n.home.choice_filter_settled,
						variant: historyFilter === 'settled' ? 'primary' : 'secondary',
						onclick: chooseFilter('settled')
					},
					{
						id: 'filter-refunded',
						label: $i18n.home.choice_filter_refunded,
						variant: historyFilter === 'refunded' ? 'primary' : 'secondary',
						onclick: chooseFilter('refunded')
					}
				]}
			/>
		{/if}

		{#if intentCreate}
			<ChatBubble side="bot">
				{$i18n.home.bot_pay_or_receive}
			</ChatBubble>

			<ChatChoiceRow
				choices={[
					{
						id: 'pay',
						label: $i18n.home.choice_pay,
						variant: mode === 'pay' ? 'primary' : 'secondary',
						onclick: choosePay
					},
					{
						id: 'receive',
						label: $i18n.home.choice_receive,
						variant: mode === 'receive' ? 'primary' : 'secondary',
						onclick: chooseReceive
					}
				]}
			/>
		{/if}

		{#if mode !== undefined}
			<ChatBubble side="bot">
				{$i18n.home.bot_wizard_or_expert}
			</ChatBubble>

			<ChatChoiceRow
				choices={[
					{
						id: 'guided',
						label: $i18n.home.choice_guided,
						variant: path === 'guided' ? 'primary' : 'secondary',
						onclick: chooseGuided
					},
					{
						id: 'expert',
						label: $i18n.home.choice_expert,
						variant: path === 'expert' ? 'primary' : 'secondary',
						onclick: chooseExpert
					}
				]}
			/>
		{/if}

		<div class="mt-auto pt-[20px]">
			<InfoLink label={$i18n.home.help_label} href="https://github.com/AntonioVentilii/escrow" />
		</div>
	</Sheet>

	<AppBottomNav />
{/if}
