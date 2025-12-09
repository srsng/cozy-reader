<script lang="ts">
    import type { PageInfo, TimeInfo } from '$lib/reader/types';
    import type { ReaderSettings } from '$lib/reader/settings';

    interface Props {
        section?: PageInfo;
        pageinfo?: PageInfo;
        timeinfo?: TimeInfo;
        readerSettings?: ReaderSettings | null;
    }

    const { section, pageinfo, timeinfo, readerSettings }: Props = $props();

    const formatProgress = (current: number | undefined, total: number | undefined): string => {
        if (!current || !total) return '0 / 0';
        const style = readerSettings?.progressStyle || 'fraction';
        if (style === 'percentage') {
            const percent = Math.round((current / total) * 100);
            return `${percent}%`;
        }
        return `${current} / ${total}`;
    };
</script>

{#if readerSettings?.showProgressInfo}
    <div
        class="bg-base-100/80 text-base-content/70 absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md px-3 py-1 text-xs shadow-md"
    >
        {formatProgress(pageinfo?.current, pageinfo?.total)}
    </div>
{/if}

{#if readerSettings?.showRemainingTime && timeinfo}
    <div
        class="bg-base-100/80 text-base-content/70 absolute bottom-4 left-4 rounded-md px-3 py-1 text-xs shadow-md"
    >
        剩余 {Math.round(timeinfo.section)} 分钟
    </div>
{/if}
