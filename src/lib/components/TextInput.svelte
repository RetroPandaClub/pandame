<script lang="ts">
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
		ariaLabel
	}: Props = $props();

	const handleInput = (event: Event) => {
		const target = event.target as HTMLInputElement;
		value = target.value;
		oninput(target.value);
	};
</script>

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
	class="bg-bg text-body1 text-default placeholder:text-subtle focus:border-primary focus:ring-primary/30 w-full rounded-md border px-4 py-3 focus:ring-2 focus:outline-none {invalid
		? 'border-danger focus:border-danger focus:ring-danger/30'
		: 'border-border'} {mono ? 'font-mono' : ''} {disabled ? 'cursor-not-allowed opacity-60' : ''}"
/>
