<script lang="ts">
    import type { Insets } from '$lib/reader/utils/insets';

    interface Props {
        borderColor: string;
        showHeader: boolean;
        showFooter: boolean;
        insets: Insets;
    }

    const { borderColor, showHeader, showFooter, insets }: Props = $props();

    const paddingPx = 10;
</script>

<div>
    <!-- outer frame -->
    <div
        class="borderframe pointer-events-none absolute"
        style="border: 4px solid {borderColor}; height: calc(100% - ${insets.top +
            insets.bottom}px + ${paddingPx *
            2}px); top: calc(${insets.top}px - ${paddingPx}px); left: calc(${insets.left}px - ${paddingPx}px); right: calc(${insets.right}px - ${paddingPx}px);"
    ></div>
    <!-- inner frame -->
    <div
        class="borderframe pointer-events-none absolute"
        style="border: 1px solid {borderColor}; height: calc(100% - ${insets.top +
            insets.bottom}px); top: ${insets.top}px; left: calc(${insets.left +
            (showFooter ? 32 : 0)}px); right: calc(${insets.right + (showHeader ? 32 : 0)}px);"
    ></div>
    <!-- footer -->
    {#if showFooter}
        <div
            class="borderframe pointer-events-none absolute"
            style="border-top: 1px solid {borderColor}; border-bottom: 1px solid {borderColor}; border-left: 1px solid {borderColor}; width: 32px; height: calc(100% - ${insets.top +
                insets.bottom}px); top: ${insets.top}px; left: calc(${insets.left}px);"
        ></div>
    {/if}
    <!-- header -->
    {#if showHeader}
        <div
            class="borderframe pointer-events-none absolute"
            style="border-top: 1px solid {borderColor}; border-bottom: 1px solid {borderColor}; border-right: 1px solid {borderColor}; width: 32px; height: calc(100% - ${insets.top +
                insets.bottom}px); top: ${insets.top}px; left: calc(100% - ${insets.right}px - 32px);"
        ></div>
    {/if}
</div>
