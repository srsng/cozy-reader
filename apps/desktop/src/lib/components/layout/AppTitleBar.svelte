<script lang="ts" module>
    import ConfigurableBar from './ConfigurableBar.svelte';
    import { inject } from '$lib/utils/context';
    import { USER_SETTINGS } from '$lib/stores/userSettings';
    import { slide } from 'svelte/transition';
    import { cn } from '$utils';
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
    class:hidden={!$currentSettings.layout.titlebar}
    class:border-b={$currentSettings.base.layoutControlsOutline}
    class:border-muted={$currentSettings.base.layoutControlsOutline}
    class={cn('bg-card flex h-8 w-full select-none items-center justify-between ', className)}
    {...others}
    transition:slide={{ axis: 'y' }}
>
    <ConfigurableBar
        data-tauri-drag-region
        config={$currentSettings.layout.layoutConfigs.titlebar}
        className="flex w-full items-center justify-between px-2"
    />
</div>

<style>
</style>
