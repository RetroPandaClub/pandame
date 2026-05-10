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
  14 × 14 checkbox (`rounded-[4px]`, lavender-tint fill, primary
  border) + a 14 px / 20 px label rendered in three slots so the
  link colour stays inside the dictionary:
    {prefix}{brand}{linkLabel}{suffix}
  e.g. "I agree with " + "PandaMe" + " " + "Terms & Agreement".
  The link label renders in `--color-terms-link`.
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
