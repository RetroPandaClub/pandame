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

	let mode: Mode | undefined = $state(undefined);
	let path: Path | undefined = $state(undefined);

	const choosePay = () => {
		mode = 'pay';
	};
	const chooseReceive = () => {
		mode = 'receive';
	};
	const chooseGuided = async () => {
		path = 'guided';
		await goto('/deals/new');
	};
	const chooseExpert = async () => {
		path = 'expert';
		await goto('/deals/new?mode=expert');
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
			class="text-default-inverse flex h-[36px] items-center justify-center rounded-[55px] border border-[rgba(133,88,237,0.67)] bg-transparent px-[24px] font-sans text-[16px] leading-[24px] font-normal"
		>
			{$i18n.home.opening_chip}
		</span>
	</BrandHeader>

	<Sheet paddingClass="px-[19px] pt-[28px] pb-[120px]" class="gap-[20px]">
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
					variant: mode !== undefined ? 'primary' : 'secondary',
					onclick: () => {
						mode = mode ?? 'pay';
					}
				},
				{
					id: 'history',
					label: $i18n.home.choice_history,
					variant: 'secondary',
					onclick: async () => {
						await goto('/history');
					}
				}
			]}
		/>

		{#if mode !== undefined}
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
