<script lang="ts">
    import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
    import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
    import { cn } from '$lib/utils.js';

    let {
        ref = $bindable(null),
        class: className,
        inset,
        children,
        ...restProps
    }: DropdownMenuPrimitive.SubTriggerProps & {
        inset?: boolean;
    } = $props();
</script>

<DropdownMenuPrimitive.SubTrigger
    bind:ref
    data-slot="dropdown-menu-sub-trigger"
    data-inset={inset}
    class={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 outline-hidden flex cursor-default select-none items-center gap-1.5 rounded-md px-1.5 py-1 text-sm data-[inset]:pl-8 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
    )}
    {...restProps}
>
    {@render children?.()}
    <ChevronRightIcon class="ml-auto" />
</DropdownMenuPrimitive.SubTrigger>
