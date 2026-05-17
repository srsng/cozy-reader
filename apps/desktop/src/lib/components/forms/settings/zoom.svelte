<script lang="ts" module>
    import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-svelte';
    import { Button } from '$ui/button';
    import { Label } from '$ui/label';
    import { m } from '$lib/paraglide/messages';
    import { USER_SETTINGS } from '$lib/stores/userSettings';
    import { inject } from '$lib/utils/context';
    import { COMMAND_SERVICE } from '$lib/commands';
</script>

<script lang="ts">
    const { label = false }: { label?: boolean } = $props();

    const userSettings = inject(USER_SETTINGS);
    const commandService = inject(COMMAND_SERVICE);
    type ZoomCommandId = 'zoom.in' | 'zoom.out' | 'zoom.reset';

    function executeZoom(commandId: ZoomCommandId) {
        commandService.execute(commandId);
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="flex gap-2" oncontextmenu={(e) => e.preventDefault()}>
    <Button
        size="icon"
        title={m['settings.zoom-out']()}
        onclick={() => executeZoom('zoom.out')}
    >
        <ZoomOut />
    </Button>
    {#if label}
        <Button title={m['settings.zoom-current']()} variant="ghost">
            <Label>
                {($userSettings.base.zoom * 100).toFixed(1)}%
            </Label>
        </Button>
    {/if}
    <Button
        size="icon"
        title={m['settings.zoom-in']()}
        onclick={() => executeZoom('zoom.in')}
    >
        <ZoomIn />
    </Button>
    <!-- reset -->
    <Button
        size="icon"
        title={m['settings.zoom-reset']()}
        onclick={() => executeZoom('zoom.reset')}
    >
        <RotateCcw />
    </Button>
</div>
