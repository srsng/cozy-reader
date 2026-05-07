<script lang="ts">
    import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';
    import { cn, type WithoutChild } from '$lib/utils.js';
    import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

    let {
        ref = $bindable(null),
        class: className,
        inset,
        children,
        ...restProps
    }: WithoutChild<ContextMenuPrimitive.SubTriggerProps> & {
        inset?: boolean;
    } = $props();
</script>

<ContextMenuPrimitive.SubTrigger
    bind:ref
    data-slot="context-menu-sub-trigger"
    data-inset={inset}
    class={cn(
        "focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground data-inset:pl-7 outline-hidden data-inset:ps-8 flex cursor-default select-none items-center gap-1.5 rounded-md px-1.5 py-1 text-sm [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
    )}
    {...restProps}
>
    {@render children?.()}
    <ChevronRightIcon class="ml-auto" />
</ContextMenuPrimitive.SubTrigger>
