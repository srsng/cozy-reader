<script lang="ts">
    import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';
    import { cn } from '$lib/utils.js';

    let {
        ref = $bindable(null),
        class: className,
        ...restProps
    }: NavigationMenuPrimitive.LinkProps = $props();
</script>

<NavigationMenuPrimitive.Link
    bind:ref
    data-slot="navigation-menu-link"
    class={cn(
        "data-active:focus:bg-muted data-active:hover:bg-muted data-active:bg-muted/50 focus-visible:ring-ring/50 hover:bg-muted focus:bg-muted focus-visible:ring-3 in-data-[slot=navigation-menu-content]:rounded-md flex items-center gap-2 rounded-lg p-2 text-sm outline-none transition-all focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
        className
    )}
    {...restProps}
/>
