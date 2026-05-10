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

<!--
  Three concentric-circle radios laid out with `gap-[22px]`. The
  active option grows: outer 102 × 102 + inner 90.7 px filled solid
  purple; the inactive options stay at outer 83.6 × 83.6 + inner
  74.3 px on a light-purple wash with a thin purple ring. Numbers
  are Roboto Bold (18.1 / 14.9 px); labels are Roboto Medium two
  lines underneath the number (Fast / Little debated, Fair /
  Recommended, Less fast / More discussed). Active text is white,
  inactive text is Blu Night.
-->
<div role="radiogroup" aria-label={ariaLabel} class="flex items-center justify-center gap-[22px]">
	{#each options as option (option.id)}
		{@const active = value === option.id}
		{@const outer = active ? 102 : 83.571}
		{@const inner = active ? 90.667 : 74.286}
		{@const numberSize = active ? 18.133 : 14.857}
		{@const titleSize = active ? 9.067 : 7.429}
		{@const subtitleSize = active ? 7.933 : 6.5}
		<button
			type="button"
			role="radio"
			aria-checked={active}
			{disabled}
			onclick={select(option.id)}
			class="font-numeric relative flex shrink-0 items-center justify-center transition-opacity {disabled
				? 'cursor-not-allowed opacity-60'
				: ''}"
			style="width: {outer}px; height: {outer}px;"
		>
			<svg viewBox="0 0 100 100" class="absolute inset-0 h-full w-full" aria-hidden="true">
				<circle
					cx="50"
					cy="50"
					r="49"
					fill={active ? 'var(--color-primary)' : 'var(--color-primary-light)'}
					fill-opacity={active ? '1' : '0.4'}
					stroke={active ? 'var(--color-primary-stroke)' : 'var(--color-primary-light)'}
					stroke-width="2"
				/>
				<circle
					cx="50"
					cy="50"
					r={(inner / outer) * 49}
					fill={active ? 'var(--color-primary)' : 'transparent'}
					stroke={active ? 'var(--color-primary-stroke)' : 'var(--color-primary)'}
					stroke-width={active ? '0' : '1.5'}
				/>
			</svg>

			<div
				class="relative flex flex-col items-center text-center {active
					? 'text-default-inverse'
					: 'text-default'}"
			>
				<span class="font-medium" style="font-size: {titleSize}px; line-height: 1;">
					{option.title}
				</span>
				<span
					class="font-medium"
					style="font-size: {subtitleSize}px; line-height: 1; margin-top: 2px;"
				>
					{option.subtitle}
				</span>
				<span class="mt-[6px] font-bold" style="font-size: {numberSize}px; line-height: 1;">
					{option.votes}
				</span>
			</div>
		</button>
	{/each}
</div>
