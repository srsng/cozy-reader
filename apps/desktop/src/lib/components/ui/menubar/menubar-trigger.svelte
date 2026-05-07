<script lang="ts">
    import { Menubar as MenubarPrimitive } from 'bits-ui';
    import { cn } from '$lib/utils.js';

    let {
        ref = $bindable(null),
        class: className,
        ...restProps
    }: MenubarPrimitive.TriggerProps = $props();
</script>

<MenubarPrimitive.Trigger
    bind:ref
    data-slot="menubar-trigger"
    class={cn(
        'hover:bg-muted aria-expanded:bg-muted outline-hidden flex select-none items-center rounded-sm px-1.5 py-[2px] text-sm font-medium',
        className
    )}
    {...restProps}
/>
