<script lang="ts" module>
    import { X } from 'lucide-svelte';
    import { Button, type ButtonVariant } from '$ui/button';
    import { cn } from '$lib/utils';
    import { inject } from '$lib/utils/context';
    import { MENU_SERVICE } from '$lib/menus';
    import { createTitleBarAction } from './titlebarAction.svelte';
</script>

<script lang="ts">
    const commandId = 'window.close';
    const {
        name = 'close-button',
        title: titleProp = undefined,
        variant = 'bar' as const,
        size = 'icon' as const,
        className = 'size-6',
        iconClass = 'size-4',
        disabled = false,
        onClick = undefined,
        ...others
    }: {
        name?: string;
        title?: string;
        variant?: ButtonVariant;
        size?: 'default' | 'sm' | 'lg' | 'icon';
        className?: string;
        iconClass?: string;
        disabled?: boolean;
        onClick?: (() => void) | undefined;
    } = $props();

    const menuService = inject(MENU_SERVICE);
    const action = createTitleBarAction(menuService, commandId, '关闭');
    const title = $derived(titleProp ?? action.title);
    const buttonDisabled = $derived(disabled || (!onClick && action.disabled));
</script>

<Button
    {name}
    {title}
    {variant}
    {size}
    class={cn('hover:bg-destructive hover:text-destructive-foreground', className)}
    disabled={buttonDisabled}
    {...others}
    onclick={onClick || action.execute}
>
    <X class={iconClass} />
</Button>
