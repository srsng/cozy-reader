<script lang="ts" module>
    import ConfigurableBar from '$lib/components/layout/ConfigurableBar.svelte';
    import { titleBarPreviewSurfaceClass } from '$lib/components/layout/titlebarLayout';
    import type { BarConfig, TitleBarItemConfig } from '$lib/settings/Layout';
</script>

<script lang="ts">
    let {
        config,
        selectedItemId = null,
        editing = false,
        onSelect
    }: {
        config: BarConfig;
        selectedItemId?: string | null;
        editing?: boolean;
        onSelect?: (item: TitleBarItemConfig) => void;
    } = $props();
</script>

<div class={titleBarPreviewSurfaceClass}>
    <ConfigurableBar {config} mode="preview" {editing} {selectedItemId} {onSelect} />
</div>
