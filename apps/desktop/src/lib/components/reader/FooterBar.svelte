<script lang="ts">
    import type { Book } from '@cozy-reader/database';
    import type { PageInfo, TimeInfo } from '$lib/reader/types';
    import { readerStore } from '$lib/reader/stores/readerStore';
    import { sidebarStore } from '$lib/reader/stores/sidebarStore';
    import { Button } from '$ui/button';
    import { ChevronLeft, ChevronRight } from '@lucide/svelte';

    interface Props {
        bookKey: string;
        book: Book;
        section?: PageInfo;
        pageinfo?: PageInfo;
        timeinfo?: TimeInfo;
        isVisible: boolean;
    }

    const { bookKey, book, section, pageinfo, timeinfo, isVisible }: Props = $props();

    let hovered = $state(false);
    const viewState = $derived(readerStore.getViewState(bookKey));
    const readerSettings = $derived(viewState?.readerSettings);
    const view = $derived(viewState?.view);

    const handlePrevPage = async () => {
        if (view) {
            await view.prev();
        }
    };

    const handleNextPage = async () => {
        if (view) {
            await view.next();
        }
    };

    const handleGoToFraction = async (fraction: number) => {
        if (view) {
            await view.goToFraction(fraction);
        }
    };

    const formatProgress = (current: number | undefined, total: number | undefined): string => {
        if (!current || !total) return '1 / 1';
        const percent = total > 0 ? Math.round((current / total) * 100) : 0;
        return `${current} / ${total} (${percent}%)`;
    };
</script>

{#if isVisible || hovered}
    <footer
        aria-label="阅读器底部栏"
        class="bg-card flex h-14 flex-shrink-0 items-center justify-between px-4"
        onpointerenter={() => (hovered = true)}
        onpointerleave={() => (hovered = false)}
    >
        <div class="flex items-center gap-2" role="toolbar" aria-label="页面导航">
            <Button variant="ghost" size="sm" onclick={handlePrevPage} aria-label="上一页">
                <ChevronLeft class="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onclick={handleNextPage} aria-label="下一页">
                <ChevronRight class="h-5 w-5" />
            </Button>
        </div>
        <div class="flex flex-1 items-center justify-center px-4">
            {#if readerSettings?.showProgressInfo}
                <span class="text-base-content/70 text-xs" aria-live="polite">
                    {formatProgress(pageinfo?.current, pageinfo?.total)}
                </span>
            {/if}
        </div>
        <div class="flex items-center gap-2">
            {#if timeinfo && readerSettings?.showRemainingTime}
                <span class="text-base-content/70 text-xs" aria-live="polite">
                    剩余 {Math.round(timeinfo.section)} 分钟
                </span>
            {/if}
        </div>
    </footer>
{/if}
