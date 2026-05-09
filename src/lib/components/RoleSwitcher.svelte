<script lang="ts">
	import { goto } from '$app/navigation';
	import { i18n } from '$lib/stores/i18n.store';

	export type Role = 'user' | 'arbitrator' | 'admin';

	interface Props {
		current: Role;
	}

	let { current }: Props = $props();

	const ROUTES: Record<Role, string> = {
		user: '/profile',
		arbitrator: '/profile/arbitrator',
		admin: '/profile/admin'
	};

	const select = (role: Role) => async () => {
		if (role === current) {
			return;
		}

		await goto(ROUTES[role]);
	};
</script>

<div
	role="tablist"
	aria-label={$i18n.profile.role_switch_aria}
	class="rounded-pill border-border bg-bg inline-flex items-center border p-1"
>
	{#each ['user', 'arbitrator', 'admin'] as const as role (role)}
		{@const active = current === role}
		<button
			type="button"
			role="tab"
			aria-selected={active}
			onclick={select(role)}
			class="rounded-pill text-body2 px-3 py-1 font-bold transition-colors {active
				? 'bg-primary text-white'
				: 'text-default hover:bg-primary/10'}"
		>
			{role === 'user'
				? $i18n.profile.role_user
				: role === 'arbitrator'
					? $i18n.profile.role_arbitrator
					: $i18n.profile.role_admin}
		</button>
	{/each}
</div>
