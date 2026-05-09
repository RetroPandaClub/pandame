<script lang="ts">
	import { goto } from '$app/navigation';
	import { userSignedIn } from '$lib/derived/user.derived';

	interface Props {
		/** Where to send the user when the session is missing or expires. */
		redirectTo?: string;
	}

	let { redirectTo = '/' }: Props = $props();

	$effect(() => {
		if (!$userSignedIn) {
			goto(redirectTo);
		}
	});
</script>
