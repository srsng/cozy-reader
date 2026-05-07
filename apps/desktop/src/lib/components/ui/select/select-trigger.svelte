<script lang="ts">
    import { Select as SelectPrimitive } from 'bits-ui';
    import { cn, type WithoutChild } from '$lib/utils.js';
    import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

    let {
        ref = $bindable(null),
        class: className,
        children,
        size = 'default',
        ...restProps
    }: WithoutChild<SelectPrimitive.TriggerProps> & {
        size?: 'sm' | 'default';
    } = $props();
</script>

<SelectPrimitive.Trigger
    bind:ref
    data-slot="select-trigger"
    data-size={size}
    class={cn(
        "border-input data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:ring-3 aria-invalid:ring-3 flex w-fit select-none items-center justify-between gap-1.5 whitespace-nowrap rounded-lg border bg-transparent py-2 pl-2.5 pr-2 text-sm outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
    )}
    {...restProps}
>
    {@render children?.()}
    <ChevronDownIcon class="text-muted-foreground pointer-events-none size-4" />
</SelectPrimitive.Trigger>
