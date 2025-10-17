<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let { children } = $props();

	// Set up initial user cookies if not present (for demo purposes)
	onMount(() => {
		if (browser) {
			if (!document.cookie.includes('userId')) {
				document.cookie = 'userId=1; path=/';
				document.cookie = 'username=alice; path=/';
			}
		}
	});
</script>

<svelte:head>
	<title>Photo Sharing App</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

{@render children?.()}
