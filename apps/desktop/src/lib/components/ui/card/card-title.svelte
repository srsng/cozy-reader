<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { cn, type WithElementRef } from '$lib/utils.js';
    import { fade } from 'svelte/transition';

    let {
        ref = $bindable(null),
        class: className,
        children,
        ...restProps
    }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
    in:fade
    bind:this={ref}
    data-slot="card-title"
    class={cn('text-base font-medium leading-snug group-data-[size=sm]/card:text-sm', className)}
    {...restProps}
>
    {@render children?.()}
</div>
