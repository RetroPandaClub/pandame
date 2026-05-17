<script lang="ts">
	import BackIcon from '$lib/components/icons/BackIcon.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		onclick?: () => void | Promise<void>;
		/** Override the default "back to dashboard" label (e.g. dispute → "Cancel"). */
		ariaLabel?: string;
	}

	let { onclick, ariaLabel }: Props = $props();
</script>

<!-- White-on-tint back chevron for any BrandHeader.leading slot.
     44 × 24 keeps the touch target ≥ 44 px while preserving the
     24 px visual icon size used across the app's tinted headers. -->
<button
	type="button"
	{onclick}
	aria-label={ariaLabel ?? $i18n.core.text.back_to_dashboard}
	class="text-default-inverse inline-flex h-[44px] w-[44px] items-center justify-center rounded-full transition-opacity hover:opacity-80 active:opacity-60"
>
	<span class="flex h-[24px] w-[24px] items-center justify-center">
		<BackIcon />
	</span>
</button>
