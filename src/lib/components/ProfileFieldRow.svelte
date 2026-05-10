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
  Inline-editable row: click to enter edit mode, Enter / blur
  commits, Esc cancels. `editable={false}` disables the click
  target and hides the pencil — used for read-only rows.
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
