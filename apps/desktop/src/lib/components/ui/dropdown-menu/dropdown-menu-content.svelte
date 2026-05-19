<script lang="ts">
    import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';
    import DropdownMenuPortal from './dropdown-menu-portal.svelte';
    import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
    import type { ComponentProps } from 'svelte';

    let {
        ref = $bindable(null),
        sideOffset = 4,
        align = 'start',
        portalProps,
        class: className,
        ...restProps
    }: DropdownMenuPrimitive.ContentProps & {
        portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DropdownMenuPortal>>;
    } = $props();
</script>

<DropdownMenuPortal {...portalProps}>
    <DropdownMenuPrimitive.Content
        bind:ref
        data-slot="dropdown-menu-content"
        {sideOffset}
        {align}
        class={cn(
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2 w-auto data-[state=closed]:overflow-hidden z-50 min-w-32 overflow-y-auto overflow-x-hidden rounded-lg p-1 shadow-md outline-none ring-1 duration-100',
            className
        )}
        {...restProps}
    />
</DropdownMenuPortal>
