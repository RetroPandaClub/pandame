<script lang="ts">
	import { Votes, type VoteName } from '$lib/enums/dispute';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		value: VoteName | undefined;
		onchange?: (next: VoteName) => void;
		/**
		 * The `withdraw_dispute` boundary rejects `Abstain` proposals
		 * (parties must agree on a verdict, not on "no opinion").
		 * Hide it from the picker when the picker drives a withdraw flow.
		 */
		excludeAbstain?: boolean;
		ariaLabel?: string;
		disabled?: boolean;
	}

	let {
		value = $bindable(undefined),
		onchange = () => {},
		excludeAbstain = false,
		ariaLabel = 'Vote choice',
		disabled = false
	}: Props = $props();

	interface Option {
		id: VoteName;
		title: string;
		description: string;
	}

	let options = $derived.by((): Option[] => {
		const all: Option[] = [
			{
				id: Votes.ConcludedCorrectly,
				title: $i18n.dispute.vote_cc_title,
				description: $i18n.dispute.vote_cc_description
			},
			{
				id: Votes.IncorrectlyConcluded,
				title: $i18n.dispute.vote_ic_title,
				description: $i18n.dispute.vote_ic_description
			},
			{
				id: Votes.Abstain,
				title: $i18n.dispute.vote_abstain_title,
				description: $i18n.dispute.vote_abstain_description
			}
		];

		return excludeAbstain ? all.filter((o) => o.id !== Votes.Abstain) : all;
	});

	const select = (id: VoteName) => () => {
		if (disabled) {
			return;
		}
		value = id;
		onchange(id);
	};
</script>

<div role="radiogroup" aria-label={ariaLabel} class="flex flex-col gap-2">
	{#each options as option (option.id)}
		{@const active = value === option.id}
		<button
			type="button"
			role="radio"
			aria-checked={active}
			{disabled}
			onclick={select(option.id)}
			class="flex flex-col items-start gap-1 rounded-md border-[1.5px] px-4 py-3 text-left transition-colors {active
				? 'border-primary-stroke bg-primary/10 text-default'
				: 'border-border-soft bg-bg-elevated text-default hover:border-primary-stroke/60'} {disabled
				? 'cursor-not-allowed opacity-60'
				: ''}"
		>
			<span class="text-body1 font-bold">{option.title}</span>
			<span class="text-body2 text-muted">{option.description}</span>
		</button>
	{/each}
</div>
