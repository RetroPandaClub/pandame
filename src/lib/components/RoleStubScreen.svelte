<script lang="ts">
	import { goto } from '$app/navigation';
	import AppBottomNav from '$lib/components/AppBottomNav.svelte';
	import BrandHeader from '$lib/components/BrandHeader.svelte';
	import Chip from '$lib/components/Chip.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import RoleSwitcher, { type Role } from '$lib/components/RoleSwitcher.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		role: Role;
		title: string;
		description: string;
	}

	let { role, title, description }: Props = $props();
</script>

<BrandHeader title={$i18n.profile.title}>
	{#snippet leading()}
		<IconButton
			ariaLabel={$i18n.core.text.back_to_dashboard}
			variant="ghost"
			onclick={() => goto('/')}
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M15 18l-6-6 6-6" />
			</svg>
		</IconButton>
	{/snippet}

	{#snippet trailing()}
		<Chip variant="outline">{$i18n.profile.role_stub_card_label}</Chip>
	{/snippet}
</BrandHeader>

<section class="flex flex-1 flex-col gap-5 px-6 pt-6 pb-28">
	<div class="flex justify-center">
		<RoleSwitcher current={role} />
	</div>

	<div
		class="border-warning/40 bg-warning/10 flex flex-col gap-3 rounded-xl border p-5"
		role="note"
	>
		<h2 class="text-h6 text-default font-bold">{title}</h2>
		<p class="text-body2 text-default">{description}</p>
		<p class="text-body2 text-muted">{$i18n.profile.role_stub_hint}</p>
	</div>
</section>

<AppBottomNav />
