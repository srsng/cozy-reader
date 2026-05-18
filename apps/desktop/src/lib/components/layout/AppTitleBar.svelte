<script lang="ts" module>
    import ConfigurableBar from './ConfigurableBar.svelte';
    import { inject } from '$lib/utils/context';
    import { USER_SETTINGS } from '$lib/stores/userSettings';
    import { slide } from 'svelte/transition';
    import { cn } from '$utils';
    import { titleBarSurfaceClass } from './titlebarLayout';
</script>

<script lang="ts">
    const currentSettings = inject(USER_SETTINGS);

    const {
        className,
        ...others
    }: {
        className?: string;
    } = $props();
</script>

<!-- todo: 优化样式设置 -->
<div
    id="titlebar"
    data-tauri-drag-region
    class:hidden={!$currentSettings.layout.titlebar}
    class:border-b={$currentSettings.base.layoutControlsOutline}
    class:border-muted={$currentSettings.base.layoutControlsOutline}
    class={cn(titleBarSurfaceClass, className)}
    {...others}
    transition:slide={{ axis: 'y' }}
>
    <ConfigurableBar
        data-tauri-drag-region
        config={$currentSettings.layout.layoutConfigs.titlebar}
    />
</div>

<style>
</style>
