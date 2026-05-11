<script lang="ts">
	import Avatar from '$lib/components/Avatar.svelte';
	import CheckIcon from '$lib/components/icons/CheckIcon.svelte';
	import { userPrincipalShort, userPrincipalText } from '$lib/derived/user.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { copyToClipboard } from '$lib/utils/clipboard.utils';

	interface Props {
		/** Avatar size (mirrors the underlying Avatar component). */
		size?: 'sm' | 'md' | 'lg' | 'xl';
	}

	let { size = 'md' }: Props = $props();

	let copied = $state(false);
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	const copy = async () => {
		const text = $userPrincipalText;
		if (text === undefined || text.length === 0) {
			return;
		}

		if (!(await copyToClipboard(text))) {
			return;
		}

		copied = true;
		if (resetTimer !== undefined) {
			clearTimeout(resetTimer);
		}
		resetTimer = setTimeout(() => (copied = false), 1500);
	};

	$effect(() => () => {
		if (resetTimer !== undefined) {
			clearTimeout(resetTimer);
		}
	});
</script>

<!-- Avatar falls back to caller-principal initials when no image is set.
     The short principal is the click target — copies the full principal
     text to the clipboard, with the label crossfading to a check + "Copied!"
     for ~1.5 s. The two label states are stacked in a single CSS-grid cell
     so the badge width stays pinned to the wider (short-principal) state
     and never causes a layout shift in the BrandHeader trailing slot. -->
<button
	type="button"
	onclick={copy}
	disabled={$userPrincipalText === undefined || $userPrincipalText.length === 0}
	aria-label={copied ? $i18n.core.text.copied : $i18n.core.text.copy_principal_aria}
	class="text-default-inverse inline-flex items-center gap-[12px] font-sans text-[15px] font-normal disabled:opacity-60"
>
	<span class="relative grid items-center justify-items-center">
		<span
			class="col-start-1 row-start-1 underline underline-offset-2 transition-opacity duration-200 ease-out"
			class:opacity-0={copied}
			aria-hidden={copied}
		>
			{$userPrincipalShort}
		</span>
		<span
			class="col-start-1 row-start-1 inline-flex items-center gap-[6px] transition-opacity duration-200 ease-out"
			class:opacity-0={!copied}
			aria-hidden={!copied}
		>
			<span class="inline-flex h-[14px] w-[14px] items-center" aria-hidden="true">
				<CheckIcon />
			</span>
			{$i18n.core.text.copied}
		</span>
	</span>
	<Avatar fallback={$userPrincipalShort} {size} alt={$userPrincipalShort} />
</button>
