<script lang="ts">
    import { cn, type WithElementRef } from '$lib/utils.js';
    import type { HTMLAttributes } from 'svelte/elements';

    let {
        ref = $bindable(null),
        class: className,
        inset,
        children,
        ...restProps
    }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
        inset?: boolean;
    } = $props();
</script>

<div
    bind:this={ref}
    data-slot="context-menu-label"
    data-inset={inset}
    class={cn(
        'text-muted-foreground data-inset:pl-7 data-inset:pl-8 px-1.5 py-1 text-xs font-medium',
        className
    )}
    {...restProps}
>
    {@render children?.()}
</div>
