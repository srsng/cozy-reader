<script lang="ts" module>
    import { ButtonGroup } from '$ui/button-group';
    import type { TitleBarItemConfig } from '$lib/settings/Layout';
    import BarButton from './BarButton.svelte';
</script>

<script lang="ts">
    const {
        appTitle,
        buttons,
        className = '',
        groupClass = '',
        btnClass = '',
        textBtnClass = '',
        btnDisabled = false,
        iconClass = 'size-4',
        mode = 'runtime',
        editing = false,
        selectedItemId = null,
        onSelect,
        ...others
    }: {
        appTitle: string;
        buttons: TitleBarItemConfig[];
        className?: string;
        groupClass?: string;
        btnClass?: string;
        textBtnClass?: string;
        btnDisabled?: boolean;
        iconClass?: string;
        mode?: 'runtime' | 'preview';
        editing?: boolean;
        selectedItemId?: string | null;
        onSelect?: (item: TitleBarItemConfig) => void;
        'data-tauri-drag-region'?: boolean;
    } = $props();

    // 按order排序
    const sortedButtons = $derived([...buttons].sort((a, b) => a.order - b.order));
</script>

<div class={className} {...others}>
    <ButtonGroup class={groupClass}>
        {#each sortedButtons as button (button.id)}
            <BarButton
                config={button}
                className={btnClass}
                textClassName={textBtnClass}
                {appTitle}
                {btnDisabled}
                {iconClass}
                {mode}
                {editing}
                selected={selectedItemId === button.id}
                {onSelect}
            />
        {/each}
    </ButtonGroup>
</div>
