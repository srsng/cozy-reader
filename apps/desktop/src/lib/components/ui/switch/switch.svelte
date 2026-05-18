<script lang="ts">
    import { Switch as SwitchPrimitive } from 'bits-ui';
    import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';

    let {
        ref = $bindable(null),
        class: className,
        checked = $bindable(false),
        size = 'default',
        ...restProps
    }: WithoutChildrenOrChild<SwitchPrimitive.RootProps> & {
        size?: 'sm' | 'default';
    } = $props();
</script>

<SwitchPrimitive.Root
    bind:ref
    bind:checked
    data-slot="switch"
    data-size={size}
    class={cn(
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 dark:data-[state=unchecked]:bg-input/80 focus-visible:ring-3 aria-invalid:ring-3 group/switch data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 peer relative inline-flex shrink-0 items-center rounded-full border border-transparent outline-none transition-all after:absolute after:-inset-x-3 after:-inset-y-2 data-[size=default]:h-[18.4px] data-[size=sm]:h-[14px] data-[size=default]:w-[32px] data-[size=sm]:w-[24px]',
        className
    )}
    {...restProps}
>
    <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        class="bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 pointer-events-none block rounded-full ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 rtl:data-[state=checked]:translate-x-[calc(-100%)]"
    />
</SwitchPrimitive.Root>
