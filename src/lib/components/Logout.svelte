<script lang="ts">
	import { signOut } from '@junobuild/core';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<button
	type="button"
	onclick={() => signOut()}
	class="hover:text-primary active:text-primary/80 mt-24 flex items-center gap-2 dark:text-white"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="16"
		viewBox="0 -960 960 960"
		width="16"
		fill="currentColor"
		aria-hidden="true"
	>
		<path
			d="M120-120v-720h360v80H200v560h280v80H120Zm520-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"
		/>
	</svg>
	<span>
		<small>{$i18n.core.text.sign_out}</small>
	</span>
</button>
