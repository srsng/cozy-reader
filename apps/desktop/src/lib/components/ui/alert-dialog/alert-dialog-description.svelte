<script lang="ts">
    import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
    import { cn } from '$lib/utils.js';

    let {
        ref = $bindable(null),
        class: className,
        ...restProps
    }: AlertDialogPrimitive.DescriptionProps = $props();
</script>

<AlertDialogPrimitive.Description
    bind:ref
    data-slot="alert-dialog-description"
    class={cn(
        'text-muted-foreground *:[a]:hover:text-foreground *:[a]:underline *:[a]:underline-offset-3 text-balance text-sm md:text-pretty',
        className
    )}
    {...restProps}
/>
