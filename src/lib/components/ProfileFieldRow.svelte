<script lang="ts">
	import CheckIcon from '$lib/components/icons/CheckIcon.svelte';
	import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
	import PencilIcon from '$lib/components/icons/PencilIcon.svelte';
	import { i18n } from '$lib/stores/i18n.store';

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
  Inline-editable row: click the value to enter edit mode, then
  use the explicit ✓ / ✗ buttons (or Enter / Esc on keyboard) to
  commit / cancel. Buttons use `onmousedown.preventDefault` so a
  tap on them doesn't trigger the input's `blur` first and swallow
  the click. `editable={false}` disables the click target and hides
  the pencil — used for read-only rows.
-->
<div class="flex items-center justify-between" role="group" aria-label={ariaLabel ?? label}>
	<label
		class="text-default font-serif-ui text-[16px] leading-[24px] font-medium tracking-[-0.32px]"
		for={id}
	>
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
				onkeydown={onKeydown}
				class="text-success font-serif-ui border-success/40 focus:border-success max-w-[140px] min-w-[100px] border-b text-right text-[16px] leading-none font-medium tracking-[-0.32px] outline-none"
			/>
			<button
				type="button"
				aria-label={$i18n.profile.edit_save}
				onmousedown={(event) => event.preventDefault()}
				onclick={commit}
				class="bg-success text-default-inverse flex h-[24px] w-[24px] items-center justify-center rounded-full transition-opacity hover:opacity-85"
			>
				<span class="flex h-[14px] w-[14px] items-center"><CheckIcon /></span>
			</button>
			<button
				type="button"
				aria-label={$i18n.profile.edit_cancel}
				onmousedown={(event) => event.preventDefault()}
				onclick={cancelEdit}
				class="bg-danger text-default-inverse flex h-[24px] w-[24px] items-center justify-center rounded-full transition-opacity hover:opacity-85"
			>
				<span class="flex h-[12px] w-[12px] items-center"><CloseIcon /></span>
			</button>
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
