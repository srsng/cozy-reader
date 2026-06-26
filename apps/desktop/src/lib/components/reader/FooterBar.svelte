<script lang="ts">
    import type { Book } from '@cozy-reader/database';
    import type { PageInfo, TimeInfo } from '$lib/reader/types';
    import { readerStore } from '$lib/reader/stores/readerStore';
    import { viewPagination } from '$lib/reader/hooks/usePagination';
    import { Button } from '$ui/button';
    import { ChevronFirst, ChevronLeft, ChevronRight, ChevronLast } from '@lucide/svelte';

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
    const view = $derived(viewState?.view ?? null);

    const handlePrevSection = () => {
        viewPagination(view, readerSettings, 'left', 'section');
    };

    const handlePrevPage = () => {
        viewPagination(view, readerSettings, 'left', 'page');
    };

    const handleNextPage = () => {
        viewPagination(view, readerSettings, 'right', 'page');
    };

    const handleNextSection = () => {
        viewPagination(view, readerSettings, 'right', 'section');
    };

    const formatProgress = (current: number | undefined, total: number | undefined): string => {
        if (current == null || total == null) return '1 / 1';
        const percent = total > 0 ? Math.round((current / total) * 100) : 0;
        return `${current} / ${total} (${percent}%)`;
    };
</script>

{#if isVisible || hovered}
    <footer
        aria-label="阅读器底部栏"
        class="bg-card grid h-8 flex-shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4"
        onpointerenter={() => (hovered = true)}
        onpointerleave={() => (hovered = false)}
    >
        <div
            class="flex min-w-0 items-center justify-end gap-2"
            role="toolbar"
            aria-label="向前导航"
        >
            <Button
                variant="ghost"
                size="sm"
                onclick={handlePrevSection}
                aria-label="上一章"
                title="上一章"
            >
                <ChevronFirst />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onclick={handlePrevPage}
                aria-label="上一页"
                title="上一页"
            >
                <ChevronLeft />
            </Button>
        </div>
        <div class="flex min-w-24 items-center justify-center px-2">
            <!-- {#if readerSettings?.showProgressInfo}
                <span
                    class="text-base-content/70 whitespace-nowrap text-center text-xs"
                    aria-live="polite"
                >
                    {formatProgress(pageinfo?.current, pageinfo?.total)}
                </span>
            {/if} -->
        </div>
        <div
            class="flex min-w-0 items-center justify-start gap-2"
            role="toolbar"
            aria-label="向后导航"
        >
            <Button
                variant="ghost"
                size="icon"
                onclick={handleNextPage}
                aria-label="下一页"
                title="下一页"
            >
                <ChevronRight />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onclick={handleNextSection}
                aria-label="下一章"
                title="下一章"
            >
                <ChevronLast />
            </Button>
        </div>
    </footer>
{/if}
