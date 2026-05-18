<script lang="ts" module>
    import { cn } from '$lib/utils.js';
    import { tv } from 'tailwind-variants';

    export const navigationMenuTriggerStyle = tv({
        base: 'hover:bg-muted focus:bg-muted data-[state=open]:hover:bg-muted data-[state=open]:focus:bg-muted data-[state=open]:bg-muted/50 focus-visible:ring-ring/50 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all focus-visible:ring-3 focus-visible:outline-1 disabled:opacity-50 group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center outline-none disabled:pointer-events-none'
    });
</script>

<script lang="ts">
    import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';
    import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
    let {
        ref = $bindable(null),
        class: className,
        children,
        ...restProps
    }: NavigationMenuPrimitive.TriggerProps = $props();
</script>

<NavigationMenuPrimitive.Trigger
    bind:ref
    data-slot="navigation-menu-trigger"
    class={cn(navigationMenuTriggerStyle(), 'group', className)}
    {...restProps}
>
    {@render children?.()}
    <ChevronDownIcon
        class="group-data-[state=open]/navigation-menu-trigger:rotate-180 relative top-px ml-1 size-3 transition duration-300"
        aria-hidden="true"
    />
</NavigationMenuPrimitive.Trigger>
