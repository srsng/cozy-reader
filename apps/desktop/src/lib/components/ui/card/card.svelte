<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { cn, type WithElementRef } from '$lib/utils.js';
    import { scale } from 'svelte/transition';

    let {
        ref = $bindable(null),
        class: className,
        children,
        size = 'default',
        ...restProps
    }: WithElementRef<HTMLAttributes<HTMLDivElement>> & { size?: 'default' | 'sm' } = $props();
</script>

<div
    in:scale
    bind:this={ref}
    data-slot="card"
    data-size={size}
    class={cn(
        'ring-foreground/10 bg-card text-card-foreground has-data-[slot=card-footer]:pb-0 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl group/card flex flex-col gap-4 overflow-hidden rounded-xl py-4 text-sm ring-1 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3',
        className
    )}
    {...restProps}
>
    {@render children?.()}
</div>
