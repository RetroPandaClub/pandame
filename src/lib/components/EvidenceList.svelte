<script lang="ts">
	import { fromNullable } from '@dfinity/utils';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Evidence } from '$lib/types/dispute';
	import { nsToDate, shortPrincipal } from '$lib/utils/format.utils';

	interface Props {
		items: ReadonlyArray<Evidence>;
	}

	let { items }: Props = $props();

	const toHex = (bytes: Uint8Array): string =>
		Array.from(bytes)
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');
</script>

{#if items.length === 0}
	<p class="text-body2 text-muted">{$i18n.dispute.evidence_empty}</p>
{:else}
	<ul class="flex flex-col gap-3">
		{#each items as item, idx (idx)}
			{@const note = fromNullable(item.note)}
			{@const url = fromNullable(item.artefact_url)}
			{@const hash = fromNullable(item.artefact_sha256)}
			{@const submittedAt = nsToDate(item.submitted_at_ns)}
			<li class="border-border-soft bg-bg-elevated flex flex-col gap-2 rounded-md border p-3">
				<div class="text-body2 text-muted flex items-center justify-between">
					<span class="font-mono">{shortPrincipal(item.submitter)}</span>
					<time datetime={submittedAt.toISOString()}>{submittedAt.toLocaleString()}</time>
				</div>
				{#if note !== undefined}
					<p class="text-body1 text-default whitespace-pre-wrap">{note}</p>
				{/if}
				{#if url !== undefined}
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						class="text-body2 text-primary-stroke break-all underline"
					>
						{url}
					</a>
				{/if}
				{#if hash !== undefined}
					<p class="text-body2 text-muted font-mono break-all">
						{$i18n.dispute.evidence_hash_label}: {toHex(hash)}
					</p>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
