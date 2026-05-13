<script lang="ts">
	import {
		PANEL_SIZE_DEFAULT,
		PANEL_SIZE_FAIR,
		PANEL_SIZE_FAST,
		PANEL_SIZE_SLOW
	} from '$lib/constants/dispute.constants';
	import { i18n } from '$lib/stores/i18n.store';

	interface Option {
		votes: number;
		title: string;
		subtitle: string;
	}

	interface Props {
		value: number;
		onchange?: (next: number) => void;
		options?: readonly Option[];
		ariaLabel?: string;
		disabled?: boolean;
	}

	let {
		value = $bindable(PANEL_SIZE_DEFAULT),
		onchange = () => {},
		options,
		ariaLabel,
		disabled = false
	}: Props = $props();

	let resolvedOptions = $derived.by((): readonly Option[] => {
		if (options !== undefined) {
			return options;
		}
		return [
			{
				votes: PANEL_SIZE_FAST,
				title: $i18n.create.panel_fast_title,
				subtitle: $i18n.create.panel_fast_subtitle
			},
			{
				votes: PANEL_SIZE_FAIR,
				title: $i18n.create.panel_fair_title,
				subtitle: $i18n.create.panel_fair_subtitle
			},
			{
				votes: PANEL_SIZE_SLOW,
				title: $i18n.create.panel_slow_title,
				subtitle: $i18n.create.panel_slow_subtitle
			}
		];
	});

	let resolvedAriaLabel = $derived(ariaLabel ?? $i18n.create.panel_aria_label);

	const select = (votes: number) => () => {
		if (disabled) {
			return;
		}
		value = votes;
		onchange(votes);
	};
</script>

<!--
  Three concentric-circle radios laid out with `gap-[22px]`. The
  active option grows: outer 102 × 102 + inner 90.7 px filled solid
  primary; the inactive options stay at outer 83.6 × 83.6 + inner
  74.3 px on a light-purple wash with a thin primary ring. Numbers
  are Roboto Bold (18.1 / 14.9 px); labels are Roboto Medium two
  lines underneath the number (Fast / Little debated, Fair /
  Recommended, Less fast / More discussed). Active text is white,
  inactive text is Blu Night.

  Visual spec: Figma node 311:7640 (frame "Vote") on the
  /deals/new screen.
-->
<div
	role="radiogroup"
	aria-label={resolvedAriaLabel}
	class="flex items-center justify-center gap-[22px]"
>
	{#each resolvedOptions as option (option.votes)}
		{@const active = value === option.votes}
		{@const outer = active ? 102 : 83.571}
		{@const inner = active ? 90.667 : 74.286}
		{@const numberSize = active ? 18.133 : 14.857}
		{@const titleSize = active ? 9.067 : 7.429}
		{@const subtitleSize = active ? 7.933 : 6.5}
		<button
			type="button"
			role="radio"
			aria-checked={active}
			aria-label={`${option.title} — ${option.votes} ${$i18n.create.panel_votes_unit}`}
			{disabled}
			onclick={select(option.votes)}
			class="font-numeric relative flex shrink-0 items-center justify-center transition-opacity {disabled
				? 'cursor-not-allowed opacity-60'
				: ''}"
			style="width: {outer}px; height: {outer}px;"
			data-tid="panel-size-option"
			data-panel-size={option.votes}
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
