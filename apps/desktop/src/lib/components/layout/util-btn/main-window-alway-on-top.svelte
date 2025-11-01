<script lang="ts" module>
    import { Pin } from 'lucide-svelte';
    import { Button, type ButtonVariant } from '$ui/button';
    import { emit } from '@tauri-apps/api/event';
    import { SHORTCUT_EVENT } from '$lib/shortcuts/shortcutService';
    import { USER_SETTINGS } from '$lib/stores/userSettings';
    import { inject } from '$lib/utils/context';

    interface Props {
        name?: string;
        title?: string;
        variant?: ButtonVariant;
        size?: 'default' | 'sm' | 'lg' | 'icon';
        className?: string;
        iconClass?: string;
        onClick?: (() => void) | undefined;
    }
</script>

<script lang="ts">
    const {
        name = 'always-on-top-button',
        title = '始终置顶',
        variant = 'bar' as const,
        size = 'icon' as const,
        className = 'size-6',
        iconClass = 'size-4',
        onClick = undefined,
        ...others
    }: Props = $props();

    const currentSettings = inject(USER_SETTINGS);

    function switchAlwaysOnTop() {
        emit(SHORTCUT_EVENT, 'main-window-toggle-always-on-top');
    }
</script>

<Button
    {name}
    {title}
    {variant}
    {size}
    class={className}
    onclick={onClick || switchAlwaysOnTop}
    {...others}
>
    <Pin
        class="{iconClass} transition-transform {$currentSettings.base.alwaysOnTop
            ? 'rotate-45'
            : ''}"
    />
</Button>
