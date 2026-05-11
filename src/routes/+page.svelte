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
	type SeeDeal = 'pending' | 'created' | 'disputed' | 'history';

	// The chatbot is a single decision tree with two branches: Create
	// (multi-step wizard ending in `/deals/new`) and See Deal (one-step
	// filter pick ending in `/transactions?tab=…` or `/history`). Each
	// branch is gated by a separate `intent…` flag so the two are
	// mutually exclusive and the user can't end up in a half-finished
	// state.
	let intentCreate = $state(false);
	let intentSeeDeal = $state(false);
	let mode: Mode | undefined = $state(undefined);
	let path: Path | undefined = $state(undefined);
	let seeDeal: SeeDeal | undefined = $state(undefined);

	// Header chip text mirrors the chatbot's current branch — Figma
	// frames flip "Hello!" → "New Deal" once the user commits to the
	// create flow, and → "See Deal" once they pick the see-deals
	// branch (frame 219:306).
	let headerChip = $derived.by(() => {
		if (intentCreate) {
			return $i18n.home.chip_new_deal;
		}
		if (intentSeeDeal) {
			return $i18n.home.chip_see_deal;
		}
		return $i18n.home.chip_hello;
	});

	const startCreate = () => {
		intentCreate = true;
		intentSeeDeal = false;
	};
	const startSeeDeal = () => {
		intentSeeDeal = true;
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
	// Pending / Created / Disputed live on /transactions (one tab
	// each); History is its own page. Selecting "Disputed" still
	// lands on the right tab even though the underlying canister
	// state isn't wired yet — the tab itself surfaces the future
	// view.
	const chooseSeeDeal = (next: SeeDeal) => async () => {
		seeDeal = next;
		if (next === 'history') {
			await goto('/history');
			return;
		}
		await goto(`/transactions?tab=${next}`);
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
					variant: intentSeeDeal ? 'primary' : 'secondary',
					onclick: startSeeDeal
				}
			]}
		/>

		{#if intentSeeDeal}
			<ChatBubble side="bot">
				{$i18n.home.bot_see_deal_filter}
			</ChatBubble>

			<!--
        Four pills wrap onto two rows on a 375 px frame, matching
        the 2 × 2 layout in Figma frame 219:306.
      -->
			<ChatChoiceRow
				wrap
				choices={[
					{
						id: 'see-pending',
						label: $i18n.home.choice_see_pending,
						variant: seeDeal === 'pending' ? 'primary' : 'secondary',
						onclick: chooseSeeDeal('pending')
					},
					{
						id: 'see-created',
						label: $i18n.home.choice_see_created,
						variant: seeDeal === 'created' ? 'primary' : 'secondary',
						onclick: chooseSeeDeal('created')
					},
					{
						id: 'see-disputed',
						label: $i18n.home.choice_see_disputed,
						variant: seeDeal === 'disputed' ? 'primary' : 'secondary',
						onclick: chooseSeeDeal('disputed')
					},
					{
						id: 'see-history',
						label: $i18n.home.choice_see_history,
						variant: seeDeal === 'history' ? 'primary' : 'secondary',
						onclick: chooseSeeDeal('history')
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
