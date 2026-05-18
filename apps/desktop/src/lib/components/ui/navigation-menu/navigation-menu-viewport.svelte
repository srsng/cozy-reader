<script lang="ts">
    import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';
    import { cn } from '$lib/utils.js';

    let {
        ref = $bindable(null),
        class: className,
        ...restProps
    }: NavigationMenuPrimitive.ViewportProps = $props();
</script>

<div class={cn('absolute start-0 top-full isolate z-50 flex justify-center')}>
    <NavigationMenuPrimitive.Viewport
        bind:ref
        data-slot="navigation-menu-viewport"
        class={cn(
            'bg-popover text-popover-foreground data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:zoom-out-90 data-[state=visible]:zoom-in-90 ring-foreground/10 origin-top-center relative mt-1.5 h-[calc(var(--bits-navigation-menu-viewport-height)+1rem)] w-full overflow-hidden rounded-lg shadow ring-1 duration-100 md:w-[calc(var(--bits-navigation-menu-viewport-width)+1rem)]',
            className
        )}
        {...restProps}
    />
</div>
