<script lang="ts" module>
    import { Maximize, Minimize } from 'lucide-svelte';
    import { Button, type ButtonVariant } from '$ui/button';
    import { scale } from 'svelte/transition';
    import { inject } from '$lib/utils/context';
    import { MENU_SERVICE } from '$lib/menus';
    import { createTitleBarAction } from './titlebarAction.svelte';
</script>

<script lang="ts">
    const commandId = 'window.toggleFullscreen';
    const {
        name = 'fullscreen-button',
        title: titleProp = undefined,
        variant = 'bar' as const,
        size = 'icon' as const,
        className = 'size-6 hover:bg-destructive hover:text-destructive-foreground',
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
    const action = createTitleBarAction(menuService, commandId, '全屏');
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
    {...others}
    onclick={onClick || action.execute}
>
    {#if action.toggled}
        <div in:scale>
            <Minimize class={iconClass} />
        </div>
    {:else}
        <div in:scale>
            <Maximize class={iconClass} />
        </div>
    {/if}
    <span class="sr-only">Toggle Fullscreen</span>
</Button>
