<script lang="ts" module>
    import type { TitleBarItemConfig } from '$lib/settings/Layout';
    import BarButton from './BarButton.svelte';
</script>

<script lang="ts">
    const {
        appTitle,
        buttons,
        className = '',
        btnClass = '',
        btnDisabled = false,
        iconClass = 'size-4',
        ...others
    }: {
        appTitle: string;
        buttons: TitleBarItemConfig[];
        className?: string;
        btnClass?: string;
        btnDisabled?: boolean;
        iconClass?: string;
        'data-tauri-drag-region'?: boolean;
    } = $props();

    // 按order排序
    const sortedButtons = $derived([...buttons].sort((a, b) => a.order - b.order));
</script>

<div class={className} {...others}>
    {#each sortedButtons as button (button.id)}
        <BarButton config={button} className={btnClass} {appTitle} {btnDisabled} {iconClass} />
    {/each}
</div>
