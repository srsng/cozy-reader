<script lang="ts">
    import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';
    import { cn } from '$lib/utils.js';

    let {
        ref = $bindable(null),
        class: className,
        ...restProps
    }: ContextMenuPrimitive.SubContentProps = $props();
</script>

<ContextMenuPrimitive.SubContent
    bind:ref
    data-slot="context-menu-sub-content"
    class={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-popover text-popover-foreground min-w-32 rounded-lg border p-1 shadow-lg duration-100',
        className
    )}
    {...restProps}
/>
