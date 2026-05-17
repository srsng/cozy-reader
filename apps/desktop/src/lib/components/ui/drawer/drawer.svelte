<script lang="ts">
    import { Drawer as DrawerPrimitive } from 'vaul-svelte';

    let {
        shouldScaleBackground = true,
        open = $bindable(false),
        activeSnapPoint = $bindable(null),
        modal = true,
        ...restProps
    }: DrawerPrimitive.RootProps = $props();
</script>

<DrawerPrimitive.Root
    {shouldScaleBackground}
    {modal}
    bind:open
    bind:activeSnapPoint
    {...restProps}
/>
