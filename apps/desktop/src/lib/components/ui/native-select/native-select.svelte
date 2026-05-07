<script lang="ts">
    import { cn, type WithElementRef } from '$lib/utils.js';
    import type { HTMLSelectAttributes } from 'svelte/elements';
    import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

    type NativeSelectProps = Omit<WithElementRef<HTMLSelectAttributes>, 'size'> & {
        size?: 'sm' | 'default';
    };

    let {
        ref = $bindable(null),
        value = $bindable(),
        class: className,
        size = 'default',
        children,
        ...restProps
    }: NativeSelectProps = $props();
</script>

<div
    class={cn(
        'cn-native-select-wrapper group/native-select relative w-fit has-[select:disabled]:opacity-50',
        className
    )}
    data-slot="native-select-wrapper"
    data-size={size}
>
    <select
        bind:value
        bind:this={ref}
        data-slot="native-select"
        data-size={size}
        class="border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:ring-3 aria-invalid:ring-3 h-8 w-full min-w-0 select-none appearance-none rounded-lg border bg-transparent py-1 pl-2.5 pr-8 text-sm outline-none transition-colors disabled:pointer-events-none disabled:cursor-not-allowed data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] data-[size=sm]:py-0.5"
        {...restProps}
    >
        {@render children?.()}
    </select>
    <ChevronDownIcon
        class="text-muted-foreground pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 select-none"
        aria-hidden
        data-slot="native-select-icon"
    />
</div>
