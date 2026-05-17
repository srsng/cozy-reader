<script lang="ts">
    import { Drawer as DrawerPrimitive } from 'vaul-svelte';
    import { Drawer as DrawerRoot } from '$ui/drawer';
    import { useDialogOpenContext } from './useDialogOpenContext.svelte';

    let {
        shouldScaleBackground = true,
        open = $bindable(false),
        activeSnapPoint = $bindable(null),
        modal = true,
        ...restProps
    }: DrawerPrimitive.RootProps = $props();

    useDialogOpenContext(() => open && modal !== false);
</script>

<DrawerRoot {shouldScaleBackground} {modal} bind:open bind:activeSnapPoint {...restProps} />
