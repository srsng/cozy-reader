<script lang="ts">
    import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';
    import { cn, type WithoutChild } from '$lib/utils.js';
    import CheckIcon from '@lucide/svelte/icons/check';

    let {
        ref = $bindable(null),
        class: className,
        inset,
        children: childrenProp,
        ...restProps
    }: WithoutChild<ContextMenuPrimitive.RadioItemProps> & {
        inset?: boolean;
    } = $props();
</script>

<ContextMenuPrimitive.RadioItem
    bind:ref
    data-slot="context-menu-radio-item"
    data-inset={inset}
    class={cn(
        "focus:bg-accent focus:text-accent-foreground data-inset:pl-7 outline-hidden data-disabled:pointer-events-none data-disabled:opacity-50 relative flex cursor-default select-none items-center gap-1.5 rounded-md py-1 pl-1.5 pr-8 text-sm [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
    )}
    {...restProps}
>
    {#snippet children({ checked })}
        <span class="pointer-events-none absolute right-2">
            {#if checked}
                <CheckIcon />
            {/if}
        </span>
        {@render childrenProp?.({ checked })}
    {/snippet}
</ContextMenuPrimitive.RadioItem>
