<script lang="ts">
    import { Slider as SliderPrimitive } from 'bits-ui';
    import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';

    let {
        ref = $bindable(null),
        value = $bindable(),
        orientation = 'horizontal',
        class: className,
        ...restProps
    }: WithoutChildrenOrChild<SliderPrimitive.RootProps> = $props();
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<SliderPrimitive.Root
    bind:ref
    bind:value={value as never}
    data-slot="slider"
    {orientation}
    class={cn(
        'data-[orientation=vertical]:min-h-40 data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col relative flex w-full touch-none select-none items-center',
        className
    )}
    {...restProps}
>
    {#snippet children({ thumbItems })}
        <span
            data-slot="slider-track"
            data-orientation={orientation}
            class={cn(
                'bg-muted data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1 relative grow overflow-hidden rounded-full'
            )}
        >
            <SliderPrimitive.Range
                data-slot="slider-range"
                class={cn(
                    'bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full absolute select-none'
                )}
            />
        </span>
        {#each thumbItems as thumb (thumb.index)}
            <SliderPrimitive.Thumb
                data-slot="slider-thumb"
                index={thumb.index}
                class="border-ring ring-ring/50 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 relative block size-3 shrink-0 select-none rounded-full border bg-white transition-[color,box-shadow] after:absolute after:-inset-2 disabled:pointer-events-none disabled:opacity-50"
            />
        {/each}
    {/snippet}
</SliderPrimitive.Root>
