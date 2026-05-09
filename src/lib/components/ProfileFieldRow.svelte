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
  Figma Profile / Profile-Edit row (`71:328`, `71:387`, etc.):
    - Layout: label LEFT (Poppins Regular 16 px Blu Night, lh 19),
              value RIGHT (Poppins Bold 16 px green #1DBB8E, lh 19)
              + 14 × 14 pencil icon to the right of the value.
    - Reliability + Weight rows have no pencil (read-only).
    - Click on the row enters inline-edit mode (text input replaces
      the value, Enter commits, Esc cancels).
-->
<div
	class="flex h-[19px] items-center justify-between"
	role="group"
	aria-label={ariaLabel ?? label}
>
	<label class="text-default text-figma-16 font-sans font-normal" for={id}>
		{label}
	</label>

	{#if editing}
		<div class="flex items-center gap-[10px]">
			<!-- svelte-ignore a11y_autofocus -->
			<input
				{id}
				type="text"
				bind:value={draft}
				{placeholder}
				autofocus
				onblur={commit}
				onkeydown={onKeydown}
				class="text-success text-figma-16 border-success/40 focus:border-success max-w-[180px] min-w-[120px] border-b text-right font-sans leading-[19px] font-bold outline-none"
			/>
		</div>
	{:else}
		<button
			type="button"
			onclick={startEdit}
			disabled={!editable}
			class="text-success text-figma-16 inline-flex items-center gap-[10px] font-sans leading-[19px] font-bold {editable
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
