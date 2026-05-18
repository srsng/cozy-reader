<script lang="ts">
    import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';
    import { cn } from '$lib/utils.js';
    import ContextMenuPortal from './context-menu-portal.svelte';
    import type { ComponentProps } from 'svelte';
    import type { WithoutChildrenOrChild } from '$lib/utils.js';

    let {
        ref = $bindable(null),
        portalProps,
        class: className,
        ...restProps
    }: ContextMenuPrimitive.ContentProps & {
        portalProps?: WithoutChildrenOrChild<ComponentProps<typeof ContextMenuPortal>>;
    } = $props();
</script>

<ContextMenuPortal {...portalProps}>
    <ContextMenuPrimitive.Content
        bind:ref
        data-slot="context-menu-content"
        class={cn(
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground z-50 min-w-36 overflow-y-auto overflow-x-hidden rounded-lg p-1 shadow-md outline-none ring-1 duration-100',
            className
        )}
        {...restProps}
    />
</ContextMenuPortal>
