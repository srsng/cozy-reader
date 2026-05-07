<script lang="ts">
    import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
    import MinusIcon from '@lucide/svelte/icons/minus';
    import CheckIcon from '@lucide/svelte/icons/check';
    import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';
    import type { Snippet } from 'svelte';

    let {
        ref = $bindable(null),
        checked = $bindable(false),
        indeterminate = $bindable(false),
        class: className,
        children: childrenProp,
        ...restProps
    }: WithoutChildrenOrChild<DropdownMenuPrimitive.CheckboxItemProps> & {
        children?: Snippet;
    } = $props();
</script>

<DropdownMenuPrimitive.CheckboxItem
    bind:ref
    bind:checked
    bind:indeterminate
    data-slot="dropdown-menu-checkbox-item"
    class={cn(
        "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 outline-hidden relative flex cursor-default select-none items-center gap-1.5 rounded-md py-1 pl-1.5 pr-8 text-sm data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
    )}
    {...restProps}
>
    {#snippet children({ checked, indeterminate })}
        <span
            class="pointer-events-none absolute right-2 flex items-center justify-center"
            data-slot="dropdown-menu-checkbox-item-indicator"
        >
            {#if indeterminate}
                <MinusIcon />
            {:else if checked}
                <CheckIcon />
            {/if}
        </span>
        {@render childrenProp?.()}
    {/snippet}
</DropdownMenuPrimitive.CheckboxItem>
