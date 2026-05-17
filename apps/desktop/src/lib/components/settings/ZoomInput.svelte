<script lang="ts">
    import { Button } from '$ui/button';
    import { Label } from '$ui/label';
    import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-svelte';
    import type { UserSettings } from '$lib/settings';
    import { COMMAND_SERVICE } from '$lib/commands';
    import { inject } from '$lib/utils/context';

    let {
        settings,
        disabled = false
    }: {
        settings: UserSettings;
        disabled?: boolean;
    } = $props();

    const commandService = inject(COMMAND_SERVICE);
    type ZoomCommandId = 'zoom.in' | 'zoom.out' | 'zoom.reset';

    function executeZoom(commandId: ZoomCommandId) {
        if (disabled) return;
        commandService.execute(commandId);
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="flex gap-2" oncontextmenu={(event) => event.preventDefault()}>
    <Button title="当前缩放比例" variant="ghost" {disabled}>
        <Label>
            {(settings.base.zoom * 100).toFixed(1)}%
        </Label>
    </Button>
    <Button size="icon" title="缩小" {disabled} onclick={() => executeZoom('zoom.out')}>
        <ZoomOut />
    </Button>
    <Button size="icon" title="放大" {disabled} onclick={() => executeZoom('zoom.in')}>
        <ZoomIn />
    </Button>
    <Button size="icon" title="重置缩放" {disabled} onclick={() => executeZoom('zoom.reset')}>
        <RotateCcw />
    </Button>
</div>
