<script lang="ts">
	import { goto } from '$app/navigation';
	import { userStore } from '$lib/stores/user.store';

	interface Props {
		/** Where to send the user when the session is missing or expires. */
		redirectTo?: string;
	}

	let { redirectTo = '/' }: Props = $props();

	// Redirect only once the session is known to be absent. `undefined` means
	// it has not been restored yet: on a full page load the store starts there
	// and `initAuth` resolves it to a user or `null` a moment later. Treating
	// "not known yet" as "signed out" bounced every deep link — a shared deal
	// link, a refresh on /transactions — back to the home page, even for a
	// signed-in user.
	$effect(() => {
		if ($userStore === null) {
			goto(redirectTo);
		}
	});
</script>
