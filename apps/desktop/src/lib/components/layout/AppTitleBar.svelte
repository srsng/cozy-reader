<script lang="ts" module>
    import ConfigurableBar from './ConfigurableBar.svelte';
    import { APP_STATE } from '$lib/stores/appState';
    import { inject } from '$lib/utils/context';
    import { USER_SETTINGS } from '$lib/stores/userSettings';
    import { slide } from 'svelte/transition';
</script>

<script lang="ts">
    const currentSettings = inject(USER_SETTINGS);
    const appState = inject(APP_STATE);
</script>

<!-- todo: 优化样式设置 -->
<div
    data-tauri-drag-region={!$appState.fullscreen}
    id="titlebar"
    class:hidden={!$currentSettings.layout.titlebar}
    class:border-b={$currentSettings.base.layoutControlsOutline}
    class:border-muted={$currentSettings.base.layoutControlsOutline}
    class={'bg-card fixed left-0 right-0 top-0 flex h-8 w-full select-none items-center justify-between'}
    transition:slide={{ axis: 'y' }}
>
    <ConfigurableBar
        config={$currentSettings.layout.layoutConfigs.titlebar}
        className="flex w-full items-center justify-between px-2"
    />
</div>

<style>
</style>
