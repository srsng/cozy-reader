<script lang="ts">
    import { ScrollArea } from '$components/ui/scroll-area';
    import { readerStore } from '$lib/reader/stores/readerStore';
    import type { TOCItem } from '$lib/reader/types';
    import { Button } from '$ui/button';

    interface Props {
        bookKey: string;
    }

    const { bookKey }: Props = $props();

    const viewState = $derived(readerStore.getViewState(bookKey));
    const bookDoc = $derived(viewState?.bookDoc);
    const toc = $derived(bookDoc?.toc || []);

    const handleTOCItemClick = async (item: TOCItem) => {
        const view = viewState?.view;
        if (!view) return;

        try {
            if (item.href) {
                await view.goTo(item.href);
            } else if (item.cfi) {
                const resolved = view.resolveCFI(item.cfi);
                if (resolved) {
                    await view.goTo(resolved.index);
                }
            }
            // 导航后关闭侧边栏（如果未固定）
            // sidebarStore.setVisible(false);
        } catch (error) {
            console.error('Failed to navigate to TOC item:', error);
        }
    };

    interface ProcessedTOCItem extends TOCItem {
        level: number;
        children: ProcessedTOCItem[];
    }

    const renderTOCItems = (
        items: TOCItem[],
        level: number = 0,
        indexOffset: number = 0
    ): { items: ProcessedTOCItem[]; nextIndex: number } => {
        let currentIndex = indexOffset;
        const processedItems: ProcessedTOCItem[] = [];

        for (const item of items) {
            // 确保每个项都有唯一的 id，如果原始 id 为 undefined，使用索引生成
            const uniqueId = item.id !== undefined ? item.id : currentIndex;
            const processedItem: ProcessedTOCItem = {
                ...item,
                id: uniqueId,
                level,
                children: []
            };

            currentIndex++;

            // 递归处理子项
            if (item.subitems && item.subitems.length > 0) {
                const childResult = renderTOCItems(item.subitems, level + 1, currentIndex);
                processedItem.children = childResult.items;
                currentIndex = childResult.nextIndex;
            }

            processedItems.push(processedItem);
        }

        return { items: processedItems, nextIndex: currentIndex };
    };

    const flattenedTOC = $derived(renderTOCItems(toc).items);
</script>

<ScrollArea class="h-full pb-8">
    <nav class="flex h-full flex-col overflow-hidden p-4" aria-label="目录导航">
        <h2 class="text-lg font-semibold">目录</h2>
        {#if flattenedTOC.length === 0}
            <div
                class="text-base-content/50 flex flex-1 items-center justify-center text-sm"
                role="status"
                aria-live="polite"
            >
                暂无目录
            </div>
        {:else}
            <ul class="space-y-1" role="list">
                {#each flattenedTOC as item (item.id)}
                    <li role="listitem">
                        <Button
                            variant="ghost"
                            size="sm"
                            class="h-auto w-full justify-start py-2 text-left normal-case"
                            style="margin-left: {item.level * 1.5}rem;"
                            onclick={() => handleTOCItemClick(item)}
                            aria-label="跳转到 {item.label}"
                        >
                            <span class="line-clamp-1">{item.label}</span>
                        </Button>
                        {#if item.children && item.children.length > 0}
                            <ul class="ml-4" role="list">
                                {#each item.children as child (child.id)}
                                    <li role="listitem">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            class="h-auto w-full justify-start text-left normal-case"
                                            style="padding-left: {child.level * 1.5}rem;"
                                            onclick={() => handleTOCItemClick(child)}
                                            aria-label="跳转到 {child.label}"
                                        >
                                            <span class="line-clamp-1">{child.label}</span>
                                        </Button>
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    </nav>
</ScrollArea>
