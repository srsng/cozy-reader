<script lang="ts">
    import { Button } from '$ui/button';
    import { Label } from '$ui/label';
    import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-svelte';
    import { runSettingHandler } from './setting-handlers';
    import type { UserSettings } from '$lib/settings';
    import type { SettingViewModel } from '$lib/settings-registry';

    let {
        entry,
        settings,
        disabled = false
    }: {
        entry: SettingViewModel;
        settings: UserSettings;
        disabled?: boolean;
    } = $props();

    function emitZoom(eventName: 'zoom-in' | 'zoom-out' | 'zoom-reset') {
        if (disabled) return;
        runSettingHandler('zoom.event', entry, eventName, { settings });
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="flex gap-2" oncontextmenu={(event) => event.preventDefault()}>
    <Button title="当前缩放比例" variant="ghost" {disabled}>
        <Label>
            {(settings.base.zoom * 100).toFixed(1)}%
        </Label>
    </Button>
    <Button size="icon" title="缩小" {disabled} onclick={() => emitZoom('zoom-out')}>
        <ZoomOut />
    </Button>
    <Button size="icon" title="放大" {disabled} onclick={() => emitZoom('zoom-in')}>
        <ZoomIn />
    </Button>
    <Button size="icon" title="重置缩放" {disabled} onclick={() => emitZoom('zoom-reset')}>
        <RotateCcw />
    </Button>
</div>
