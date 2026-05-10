<script lang="ts">
	type Variant = 'default' | 'active';

	interface Props {
		id: string;
		value: string;
		oninput?: (next: string) => void;
		onblur?: () => void;
		placeholder?: string;
		disabled?: boolean;
		readonly?: boolean;
		type?: 'text' | 'email' | 'url' | 'number' | 'datetime-local';
		inputmode?: 'text' | 'numeric' | 'decimal' | 'email' | 'url';
		mono?: boolean;
		invalid?: boolean;
		ariaDescribedby?: string;
		ariaLabel?: string;
		/**
		 * `default`: 1.5 px solid light-purple border — the resting
		 * state for every form input.
		 * `active`: 1 px solid primary-stroke border — the highlighted
		 * variant used by the Amount/Currency input on the
		 * Create-Deal screen.
		 */
		variant?: Variant;
	}

	let {
		id,
		value = $bindable(''),
		oninput = () => {},
		onblur = () => {},
		placeholder,
		disabled = false,
		readonly = false,
		type = 'text',
		inputmode,
		mono = false,
		invalid = false,
		ariaDescribedby,
		ariaLabel,
		variant = 'default'
	}: Props = $props();

	const VARIANT: Record<Variant, string> = {
		default: 'border-[1.5px] border-border focus:border-primary-stroke',
		active: 'border border-primary-stroke focus:border-primary'
	};

	const handleInput = (event: Event) => {
		const target = event.target as HTMLInputElement;
		value = target.value;
		oninput(target.value);
	};
</script>

<!--
  41 px tall, full-width, `rounded-input` (8 px), 10 px inset.
  Placeholder + value rendered in Poppins Regular 14 px Blu Night
  with the resting / active border defined by `VARIANT`.
-->
<input
	{id}
	{value}
	{placeholder}
	{disabled}
	{readonly}
	{type}
	{inputmode}
	{onblur}
	oninput={handleInput}
	aria-describedby={ariaDescribedby}
	aria-label={ariaLabel}
	aria-invalid={invalid || undefined}
	class="bg-bg-elevated text-default placeholder:text-subtle rounded-input focus:ring-primary/20 h-[41px] w-full px-[10px] text-[14px] leading-none focus:ring-2 focus:outline-none {invalid
		? 'border-danger focus:border-danger focus:ring-danger/30 border-[1.5px]'
		: VARIANT[variant]} {mono ? 'font-mono' : 'font-sans'} {disabled
		? 'cursor-not-allowed opacity-60'
		: ''}"
/>
