<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		note: string;
		url: string;
		hash: string;
		progress: boolean;
		onsubmit: () => void;
	}

	let {
		note = $bindable(''),
		url = $bindable(''),
		hash = $bindable(''),
		progress,
		onsubmit
	}: Props = $props();

	let canSubmit = $derived(note.trim().length > 0 || url.trim().length > 0);
</script>

<form
	class="border-border-soft bg-bg-elevated flex flex-col gap-3 rounded-md border p-4"
	onsubmit={(e) => {
		e.preventDefault();
		onsubmit();
	}}
>
	<h3 class="text-body1 text-default font-bold">{$i18n.dispute.evidence_add_title}</h3>
	<p class="text-body2 text-muted">{$i18n.dispute.evidence_add_description}</p>

	<FormField label={$i18n.dispute.evidence_note_label} htmlFor="evidence-note">
		<textarea
			id="evidence-note"
			bind:value={note}
			placeholder={$i18n.dispute.evidence_note_placeholder}
			rows={3}
			class="bg-bg text-default placeholder:text-subtle border-border-soft rounded-input focus:border-primary-stroke focus:ring-primary-stroke/20 w-full resize-none border-[1.5px] px-[10px] py-[10px] font-sans text-[14px] focus:ring-2 focus:outline-none"
		></textarea>
	</FormField>

	<FormField
		label={$i18n.dispute.evidence_url_label}
		htmlFor="evidence-url"
		hint={$i18n.dispute.evidence_url_hint}
	>
		<TextInput id="evidence-url" bind:value={url} placeholder="https://…" />
	</FormField>

	<FormField
		label={$i18n.dispute.evidence_hash_label}
		htmlFor="evidence-hash"
		hint={$i18n.dispute.evidence_hash_hint}
	>
		<TextInput id="evidence-hash" bind:value={hash} placeholder="0x… (64 hex chars)" />
	</FormField>

	<Button type="submit" disabled={progress || !canSubmit}>
		{$i18n.dispute.evidence_submit_cta}
	</Button>
</form>
