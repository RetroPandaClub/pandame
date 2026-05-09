<script lang="ts">
	import type { Snippet } from 'svelte';

	type LabelFamily = 'sans' | 'serif-ui';

	interface Props {
		label: string;
		htmlFor: string;
		hint?: string;
		error?: string;
		required?: boolean;
		/**
		 * Figma uses two label faces:
		 *   - `sans`     (Poppins Medium 16px) — Payer wallet, Title Deal,
		 *                Agreement details, Summary, Votes in case of dispute.
		 *   - `serif-ui` (Inter Medium 16px) — Amount, Currency, Tenor,
		 *                Rate, Deposit fee, Total payment, Add Documents.
		 * Both share `tracking-[-0.32px]` and 19 px line-height on
		 * 16 px text. Default to `sans` because that's the broader case.
		 */
		labelFamily?: LabelFamily;
		children: Snippet;
	}

	let {
		label,
		htmlFor,
		hint,
		error,
		required = false,
		labelFamily = 'sans',
		children
	}: Props = $props();

	let describedBy = $derived(
		error !== undefined && error.length > 0
			? `${htmlFor}-error`
			: hint !== undefined && hint.length > 0
				? `${htmlFor}-hint`
				: undefined
	);

	const LABEL_FAMILY: Record<LabelFamily, string> = {
		sans: 'font-sans font-medium',
		'serif-ui': 'font-serif-ui font-medium'
	};
</script>

<!--
  Figma form-field row (`159:1135` / `159:1133` / `159:1152`):
    label above input, gap-[8px] (or 3px for Payer wallet — we
    standardise on 8px). Label is 16px tracking -0.32px in either
    Poppins Medium (sans) or Inter Medium (serif-ui).
-->
<label class="flex flex-col gap-[8px]" for={htmlFor}>
	<span class="text-default text-figma-16 tracking-[-0.32px] {LABEL_FAMILY[labelFamily]}">
		{label}
		{#if required}
			<span aria-hidden="true" class="text-danger">*</span>
		{/if}
	</span>

	<div aria-describedby={describedBy}>
		{@render children()}
	</div>

	{#if error !== undefined && error.length > 0}
		<small id="{htmlFor}-error" class="text-body2 text-danger">{error}</small>
	{:else if hint !== undefined && hint.length > 0}
		<small id="{htmlFor}-hint" class="text-body2 text-muted">{hint}</small>
	{/if}
</label>
