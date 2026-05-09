<script lang="ts">
	export type Quorum = 'fast' | 'fair' | 'slow';

	interface Option {
		id: Quorum;
		title: string;
		subtitle: string;
		votes: number;
	}

	interface Props {
		value: Quorum;
		onchange?: (next: Quorum) => void;
		options?: readonly Option[];
		ariaLabel?: string;
		disabled?: boolean;
	}

	const DEFAULT_OPTIONS: readonly Option[] = [
		{ id: 'fast', title: 'Fast', subtitle: 'Little debated', votes: 3 },
		{ id: 'fair', title: 'Fair', subtitle: 'Recommended', votes: 7 },
		{ id: 'slow', title: 'Less fast', subtitle: 'More discussed', votes: 11 }
	] as const;

	let {
		value = $bindable('fair'),
		onchange = () => {},
		options = DEFAULT_OPTIONS,
		ariaLabel = 'Dispute resolution speed',
		disabled = false
	}: Props = $props();

	const select = (id: Quorum) => () => {
		if (disabled) {
			return;
		}

		value = id;
		onchange(id);
	};
</script>

<div role="radiogroup" aria-label={ariaLabel} class="flex items-end justify-between gap-2">
	{#each options as option (option.id)}
		{@const active = value === option.id}
		<button
			type="button"
			role="radio"
			aria-checked={active}
			{disabled}
			onclick={select(option.id)}
			class="flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 text-center transition-colors {active
				? 'border-primary bg-primary text-default-inverse'
				: 'border-primary-light bg-primary-light/40 text-default'} {disabled
				? 'cursor-not-allowed opacity-60'
				: 'hover:border-primary'}"
		>
			<span class="text-body2 font-bold">{option.title}</span>
			<span class="text-xxs opacity-80">{option.subtitle}</span>
			<span class="text-h6 mt-1 font-black">{option.votes}</span>
		</button>
	{/each}
</div>
