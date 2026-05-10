<script lang="ts">
	import PencilIcon from '$lib/components/icons/PencilIcon.svelte';

	interface Props {
		id: string;
		label: string;
		value: string;
		placeholder?: string;
		editable?: boolean;
		onsave?: (next: string) => void | Promise<void>;
		ariaLabel?: string;
	}

	let {
		id,
		label,
		value = $bindable(''),
		placeholder = '',
		editable = true,
		onsave = () => {},
		ariaLabel
	}: Props = $props();

	let editing = $state(false);
	let draft = $state(value);

	const startEdit = () => {
		if (!editable) {
			return;
		}
		draft = value;
		editing = true;
	};

	const cancelEdit = () => {
		editing = false;
	};

	const commit = async () => {
		const next = draft.trim();
		if (next === value.trim()) {
			editing = false;
			return;
		}
		value = next;
		editing = false;
		await onsave(next);
	};

	const onKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			commit();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			cancelEdit();
		}
	};
</script>

<!--
  Profile row pattern: label LEFT (Poppins Regular 16 px / 24 px lh,
  Blu Night), value RIGHT (Inter Medium ~16 px tracking `-0.32 px`,
  success green) + a 14 × 14 pencil icon to the right of the value.
  The label uses 24 px line-height to match Figma's `leading-[24px]`
  baseline. Click the row to enter inline-edit mode (text input
  replaces the value, Enter commits, Esc cancels, blur commits).
  `editable={false}` skips the pencil and disables the click
  target — used for read-only rows (Reliability, Weight).
-->
<div class="flex items-center justify-between" role="group" aria-label={ariaLabel ?? label}>
	<label class="text-default font-sans text-[16px] leading-[24px] font-normal" for={id}>
		{label}
	</label>

	{#if editing}
		<div class="flex items-center gap-[8px]">
			<!-- svelte-ignore a11y_autofocus -->
			<input
				{id}
				type="text"
				bind:value={draft}
				{placeholder}
				autofocus
				onblur={commit}
				onkeydown={onKeydown}
				class="text-success font-serif-ui border-success/40 focus:border-success max-w-[180px] min-w-[120px] border-b text-right text-[16px] leading-none font-medium tracking-[-0.32px] outline-none"
			/>
		</div>
	{:else}
		<button
			type="button"
			onclick={startEdit}
			disabled={!editable}
			class="text-success font-serif-ui inline-flex items-center gap-[8px] text-[16px] leading-none font-medium tracking-[-0.32px] {editable
				? 'cursor-pointer hover:opacity-80'
				: 'cursor-default'}"
		>
			<span class="max-w-[180px] truncate" {id}>{value || placeholder}</span>
			{#if editable}
				<span class="text-success flex h-[14px] w-[14px] items-center">
					<PencilIcon />
				</span>
			{/if}
		</button>
	{/if}
</div>
