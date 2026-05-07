<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { cn, type WithElementRef } from '$lib/utils.js';

    let {
        ref = $bindable(null),
        class: className,
        children,
        ...restProps
    }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
    bind:this={ref}
    data-slot="alert-description"
    class={cn(
        'text-muted-foreground [&_a]:hover:text-foreground [&_a]:underline-offset-3 text-balance text-sm md:text-pretty [&_a]:underline [&_p:not(:last-child)]:mb-4',
        className
    )}
    {...restProps}
>
    {@render children?.()}
</div>
