<script lang="ts">
	import { fromNullable } from '@dfinity/utils';
	import QRCode from 'qrcode';
	import Button from '$lib/components/Button.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { SHARE_URL } from '$lib/constants/routes.constants';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		open: boolean;
		dealId: bigint;
		claimCode: [] | [string];
		onclose?: () => void;
	}

	let { open, dealId, claimCode, onclose = () => {} }: Props = $props();

	let unwrappedCode = $derived(fromNullable(claimCode));
	let shareUrl = $derived(
		unwrappedCode !== undefined ? SHARE_URL(dealId, unwrappedCode) : undefined
	);

	let qrDataUrl: string | undefined = $state(undefined);
	let copied = $state(false);

	$effect(() => {
		if (!open || shareUrl === undefined) {
			qrDataUrl = undefined;
			return;
		}

		QRCode.toDataURL(shareUrl, { errorCorrectionLevel: 'M', margin: 1, scale: 6 })
			.then((url) => (qrDataUrl = url))
			.catch((err) => {
				console.error('Failed to render share QR:', err);
				qrDataUrl = undefined;
			});
	});

	const copy = async () => {
		if (shareUrl === undefined) {
			return;
		}

		try {
			await navigator.clipboard.writeText(shareUrl);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch (err) {
			console.error('Failed to copy share link:', err);
		}
	};
</script>

<Modal {open} {onclose} title={$i18n.share.title}>
	{#if shareUrl === undefined}
		<p>{$i18n.share.no_share_needed}</p>
	{:else}
		<p class="text-muted text-body2">{$i18n.share.description}</p>

		{#if qrDataUrl !== undefined}
			<div class="flex justify-center">
				<img
					src={qrDataUrl}
					width="220"
					height="220"
					alt={$i18n.share.qr_alt}
					class="border-border-soft bg-bg-elevated rounded-lg border p-2"
				/>
			</div>
		{/if}

		<label class="block">
			<span class="text-default text-body2 font-bold">{$i18n.share.link_label}</span>
			<input
				type="text"
				readonly
				value={shareUrl}
				class="bg-bg-soft text-default border-border-soft text-xxs mt-1 w-full rounded-md border px-3 py-2 font-mono"
				aria-label={$i18n.share.link_aria}
				data-tid="share-link-input"
			/>
		</label>
	{/if}

	{#snippet footer()}
		{#if shareUrl !== undefined}
			<Button onclick={copy}>
				{copied ? $i18n.core.text.copied : $i18n.core.text.copy}
			</Button>
		{/if}
		<Button onclick={onclose}>{$i18n.core.text.done}</Button>
	{/snippet}
</Modal>
