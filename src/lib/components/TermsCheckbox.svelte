<script lang="ts">
	interface Props {
		id: string;
		checked: boolean;
		onchange?: (next: boolean) => void;
		ariaLabel?: string;
		/**
		 * `prefix` "Terms" `linkLabel` `suffix` (e.g. "I agree with PandaMe ",
		 * "Terms & Agreement", ""). Three slots so the link colour stays
		 * inside the dictionary.
		 */
		prefix: string;
		brand?: string;
		linkLabel: string;
		linkHref: string;
		suffix?: string;
	}

	let {
		id,
		checked = $bindable(false),
		onchange = () => {},
		ariaLabel,
		prefix,
		brand,
		linkLabel,
		linkHref,
		suffix = ''
	}: Props = $props();

	const handleChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		checked = target.checked;
		onchange(target.checked);
	};
</script>

<!--
  Figma `166:1549` "Agree terms":
    - 14 × 14 checkbox, rounded-[4px], bg rgba(213,196,249,0.12),
      border 1 px #6200EE.
    - Label: Inter Regular 14 px lh 20 px Blu Night, with the link
      label rendered in `--color-terms-link` (#A57FF6).
    - Layout: gap-[8px] between checkbox and label.
-->
<label class="flex items-center gap-[8px]" for={id}>
	<input
		{id}
		type="checkbox"
		{checked}
		onchange={handleChange}
		aria-label={ariaLabel}
		class="border-primary bg-primary-light/10 accent-primary h-[14px] w-[14px] cursor-pointer rounded-[4px] border"
	/>
	<span class="text-default font-serif-ui text-[14px] leading-[20px]">
		{prefix}{#if brand}<span class="text-default">{brand}</span>{/if}
		<a
			href={linkHref}
			class="text-terms-link underline-offset-2 hover:underline"
			target="_blank"
			rel="noopener noreferrer">{linkLabel}</a
		>{suffix}
	</span>
</label>
