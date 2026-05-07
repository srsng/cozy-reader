<script lang="ts">
    import { PinInput as InputOTPPrimitive } from 'bits-ui';
    import { cn } from '$lib/utils.js';

    let {
        ref = $bindable(null),
        cell,
        class: className,
        ...restProps
    }: InputOTPPrimitive.CellProps = $props();
</script>

<InputOTPPrimitive.Cell
    {cell}
    bind:ref
    data-slot="input-otp-slot"
    class={cn(
        'dark:bg-input/30 border-input data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive data-[active=true]:ring-3 relative flex size-8 items-center justify-center border-y border-r text-sm outline-none transition-all first:rounded-l-lg first:border-l last:rounded-r-lg data-[active=true]:z-10',
        className
    )}
    {...restProps}
>
    {cell.char}
    {#if cell.hasFakeCaret}
        <div
            class="cn-input-otp-caret pointer-events-none absolute inset-0 flex items-center justify-center"
        >
            <div
                class="animate-caret-blink bg-foreground bg-foreground h-4 w-px duration-1000"
            ></div>
        </div>
    {/if}
</InputOTPPrimitive.Cell>
