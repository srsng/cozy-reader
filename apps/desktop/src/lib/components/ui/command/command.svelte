<script lang="ts">
    import { cn } from '$lib/utils.js';
    import { Command as CommandPrimitive } from 'bits-ui';

    export type CommandRootApi = CommandPrimitive.Root;

    let {
        api = $bindable(null),
        ref = $bindable(null),
        value = $bindable(''),
        class: className,
        ...restProps
    }: CommandPrimitive.RootProps & {
        api?: CommandRootApi | null;
    } = $props();
</script>

<CommandPrimitive.Root
    bind:this={api}
    bind:value
    bind:ref
    data-slot="command"
    class={cn(
        'bg-popover text-popover-foreground rounded-xl! flex size-full flex-col overflow-hidden p-1',
        className
    )}
    {...restProps}
/>
