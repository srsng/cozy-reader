<script lang="ts">
    import { ScrollArea as ScrollAreaPrimitive } from 'bits-ui';
    import { cn, type WithoutChild } from '$lib/utils.js';

    let {
        ref = $bindable(null),
        class: className,
        orientation = 'vertical',
        children,
        ...restProps
    }: WithoutChild<ScrollAreaPrimitive.ScrollbarProps> = $props();
</script>

<ScrollAreaPrimitive.Scrollbar
    bind:ref
    data-slot="scroll-area-scrollbar"
    data-orientation={orientation}
    {orientation}
    class={cn(
        'data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-t-transparent data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5 data-[orientation=vertical]:border-l data-[orientation=vertical]:border-l-transparent flex touch-none select-none p-px transition-colors',
        className
    )}
    {...restProps}
>
    {@render children?.()}
    <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        class="bg-border relative flex-1 rounded-full"
    />
</ScrollAreaPrimitive.Scrollbar>
