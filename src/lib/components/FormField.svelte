<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		htmlFor: string;
		hint?: string;
		error?: string;
		required?: boolean;
		children: Snippet;
	}

	let { label, htmlFor, hint, error, required = false, children }: Props = $props();

	let describedBy = $derived(
		error !== undefined && error.length > 0
			? `${htmlFor}-error`
			: hint !== undefined && hint.length > 0
				? `${htmlFor}-hint`
				: undefined
	);
</script>

<label class="flex flex-col gap-1.5" for={htmlFor}>
	<span class="text-body2 text-default font-bold">
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
