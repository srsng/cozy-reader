<script lang="ts">
    import { Select as SelectPrimitive } from 'bits-ui';
    import { cn, type WithoutChild } from '$lib/utils.js';
    import CheckIcon from '@lucide/svelte/icons/check';

    let {
        ref = $bindable(null),
        class: className,
        value,
        label,
        children: childrenProp,
        ...restProps
    }: WithoutChild<SelectPrimitive.ItemProps> = $props();
</script>

<SelectPrimitive.Item
    bind:ref
    {value}
    data-slot="select-item"
    class={cn(
        "focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 focus:bg-accent data-highlighted:bg-accent data-highlighted:text-accent-foreground focus:text-accent-foreground outline-hidden relative flex w-full cursor-default select-none items-center gap-1.5 rounded-md py-1 pl-1.5 pr-8 text-sm data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
    )}
    {...restProps}
>
    {#snippet children({ selected, highlighted })}
        <span class="absolute end-2 flex size-3.5 items-center justify-center">
            {#if selected}
                <CheckIcon class="cn-select-item-indicator-icon" />
            {/if}
        </span>
        {#if childrenProp}
            {@render childrenProp({ selected, highlighted })}
        {:else}
            {label || value}
        {/if}
    {/snippet}
</SelectPrimitive.Item>
