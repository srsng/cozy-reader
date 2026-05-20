<script lang="ts" module>
    import { Pin } from 'lucide-svelte';
    import { Button, type ButtonVariant } from '$ui/button';
    import { cn } from '$lib/utils';
    import { inject } from '$lib/utils/context';
    import { MENU_SERVICE } from '$lib/menus';
    import { createTitleBarAction } from './titlebarAction.svelte';
    import { USER_SETTINGS } from '$lib/stores/userSettings';

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
    const commandId = 'window.toggleAlwaysOnTop';
    const {
        name = 'always-on-top-button',
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
    const action = createTitleBarAction(menuService, commandId, '始终置顶');

    const userSettings = inject(USER_SETTINGS);

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
    <Pin class={cn(iconClass, 'transition-transform', $userSettings.base.alwaysOnTop && 'rotate-45')} />
</Button>
