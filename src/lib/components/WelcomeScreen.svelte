<script lang="ts">
	import Login from '$lib/components/Login.svelte';
	import PandaMark from '$lib/components/PandaMark.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<section
	class="flex min-h-[100dvh] flex-col items-center justify-between gap-6 px-6 pt-[max(env(safe-area-inset-top),3rem)] pb-10 text-center"
>
	<h1 class="text-h5 text-default font-bold">
		{$i18n.welcome.greeting_prefix}
		<span class="font-black">{$i18n.layout.title}</span>{$i18n.welcome.greeting_suffix}
	</h1>

	<PandaMark size="xl" />

	<div class="flex w-full flex-col items-center gap-4">
		<p class="text-body1 text-muted">{$i18n.welcome.cta_caption}</p>
		<Login fullWidth />
	</div>
</section>
