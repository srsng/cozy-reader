<script lang="ts">
    import { Accordion as AccordionPrimitive } from 'bits-ui';
    import { cn, type WithoutChild } from '$lib/utils.js';

    let {
        ref = $bindable(null),
        class: className,
        children,
        ...restProps
    }: WithoutChild<AccordionPrimitive.ContentProps> = $props();
</script>

<AccordionPrimitive.Content
    bind:ref
    data-slot="accordion-content"
    class="data-open:animate-accordion-down data-closed:animate-accordion-up overflow-hidden text-sm"
    {...restProps}
>
    <div
        class={cn(
            '[&_a]:hover:text-foreground [&_a]:underline-offset-3 pb-2.5 pt-0 [&_a]:underline [&_p:not(:last-child)]:mb-4',
            className
        )}
    >
        {@render children?.()}
    </div>
</AccordionPrimitive.Content>
