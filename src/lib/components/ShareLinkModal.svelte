<script lang="ts">
	import { fromNullable } from '@dfinity/utils';
	import QRCode from 'qrcode';
	import Button from '$lib/components/Button.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { SHARE_URL } from '$lib/constants/routes.constants';

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

<Modal {open} {onclose} title="Share your deal">
	{#if shareUrl === undefined}
		<p>This deal has a known recipient — no share link is needed.</p>
	{:else}
		<p class="text-sm opacity-75">
			Send this link or QR code to the recipient. They can claim the funds at any time before the
			deal expires.
		</p>

		{#if qrDataUrl !== undefined}
			<div class="flex justify-center">
				<img
					src={qrDataUrl}
					width="220"
					height="220"
					alt="QR code linking to the claim page"
					class="dark:border-lavender-blue-500 rounded border-[3px] border-black"
				/>
			</div>
		{/if}

		<label class="block">
			<span class="text-sm font-semibold">Share link</span>
			<input
				type="text"
				readonly
				value={shareUrl}
				class="mt-1 w-full rounded-sm border-[3px] border-black bg-white px-3 py-1.5 font-mono text-xs dark:bg-black dark:text-white"
				aria-label="Share link URL"
				data-tid="share-link-input"
			/>
		</label>
	{/if}

	{#snippet footer()}
		{#if shareUrl !== undefined}
			<Button onclick={copy}>
				{copied ? 'Copied!' : 'Copy link'}
			</Button>
		{/if}
		<Button onclick={onclose}>Done</Button>
	{/snippet}
</Modal>
