<script lang="ts" module>
    import { RefreshCcw } from 'lucide-svelte';
    import { Button, type ButtonVariant } from '$ui/button';
    import { MENU_SERVICE } from '$lib/menus';
    import { inject } from '$lib/utils/context';
    import { createTitleBarAction } from './titlebarAction.svelte';

    interface Props {
        name?: string;
        title?: string;
        variant?: ButtonVariant;
        size?: 'default' | 'sm' | 'lg' | 'icon';
        className?: string;
        iconClass?: string;
        disabled?: boolean;
        onClick?: (() => void) | undefined;
    }
</script>

<script lang="ts">
    const commandId = 'window.refresh';
    const {
        name = 'refresh-button',
        title: titleProp = undefined,
        variant = 'bar' as const,
        size = 'icon' as const,
        className = 'size-6',
        iconClass = 'size-4',
        disabled = false,
        onClick = undefined,
        ...others
    }: Props = $props();

    const menuService = inject(MENU_SERVICE);
    const action = createTitleBarAction(menuService, commandId, '刷新页面');
    const title = $derived(titleProp ?? action.title);
    const buttonDisabled = $derived(disabled || (!onClick && action.disabled));
</script>

<Button
    {name}
    {title}
    {variant}
    {size}
    class={className}
    disabled={buttonDisabled}
    onclick={onClick || action.execute}
    {...others}
>
    <RefreshCcw class={iconClass} />
</Button>
