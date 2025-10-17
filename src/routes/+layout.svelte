<script lang="ts">
    import type { LayoutData } from "./$types";

    let { children, data }: { children?: any; data: LayoutData } = $props();
</script>

<svelte:head>
    <title>Photo Sharing App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

{@render children?.()}
