<script lang="ts">
    import { readerStore } from '$lib/reader/stores/readerStore';
    import type { BookSearchMatch, BookSearchResult, SearchExcerpt } from '$lib/reader/types';
    import { useScrollToItem } from '$lib/reader/hooks/useScrollToItem.svelte';
    import { cn } from '$lib/utils';

    interface Props {
        bookKey: string;
        results: BookSearchResult[] | BookSearchMatch[];
        onSelectResult: (cfi: string) => void;
    }

    const { bookKey, results, onSelectResult }: Props = $props();

    const progress = $derived(readerStore.getViewState(bookKey)?.progress ?? null);

    interface SearchResultItemProps {
        cfi: string;
        excerpt: SearchExcerpt;
    }

    function SearchResultItem({ cfi, excerpt }: SearchResultItemProps) {
        const { isCurrent, viewRef } = useScrollToItem(cfi, progress);
        let itemElement: HTMLElement | null = $state(null);

        $effect(() => {
            if (itemElement) {
                viewRef(itemElement);
            }
        });

        const handleClick = () => {
            onSelectResult(cfi);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                onSelectResult(cfi);
            } else {
                e.stopPropagation();
            }
        };

        return {
            get cfi() {
                return cfi;
            },
            get excerpt() {
                return excerpt;
            },
            get isCurrent() {
                return isCurrent;
            },
            get itemElement() {
                return itemElement;
            },
            set itemElement(value) {
                itemElement = value;
            },
            handleClick,
            handleKeyDown
        };
    }
</script>

<div class="search-results overflow-y-auto p-2 text-sm">
    <ul class="px-2">
        {#each results as result, index}
            {#if 'subitems' in result}
                <!-- 章节分组结果 -->
                {@const groupResult = result as BookSearchResult}
                <ul>
                    <h3 class="line-clamp-1 font-normal">{groupResult.label}</h3>
                    <ul>
                        {#each groupResult.subitems as item, itemIndex (item.cfi)}
                            {@const itemProps = SearchResultItem({
                                cfi: item.cfi,
                                excerpt: item.excerpt
                            })}
                            <button
                                bind:this={itemProps.itemElement}
                                type="button"
                                tabindex={0}
                                class={cn(
                                    'my-2 w-full cursor-pointer rounded-lg p-2 text-left text-sm',
                                    itemProps.isCurrent
                                        ? 'bg-accent hover:bg-accent/70'
                                        : 'hover:bg-accent bg-background'
                                )}
                                onclick={itemProps.handleClick}
                                onkeydown={itemProps.handleKeyDown}
                                aria-current={itemProps.isCurrent ? 'page' : undefined}
                            >
                                <div class="line-clamp-3">
                                    <span>{item.excerpt.pre}</span>
                                    <span class="font-bold text-red-500">{item.excerpt.match}</span>
                                    <span>{item.excerpt.post}</span>
                                </div>
                            </button>
                        {/each}
                    </ul>
                </ul>
            {:else}
                <!-- 单个匹配项 -->
                {@const match = result as BookSearchMatch}
                {@const itemProps = SearchResultItem({
                    cfi: match.cfi,
                    excerpt: match.excerpt
                })}
                <button
                    bind:this={itemProps.itemElement}
                    type="button"
                    tabindex={0}
                    class={cn(
                        'my-2 w-full cursor-pointer rounded-lg p-2 text-left text-sm',
                        itemProps.isCurrent
                            ? 'bg-accent hover:bg-accent/70'
                            : 'hover:bg-accent bg-background'
                    )}
                    onclick={itemProps.handleClick}
                    onkeydown={itemProps.handleKeyDown}
                    aria-current={itemProps.isCurrent ? 'page' : undefined}
                >
                    <div class="line-clamp-3">
                        <span>{match.excerpt.pre}</span>
                        <span class="font-bold text-red-500">{match.excerpt.match}</span>
                        <span>{match.excerpt.post}</span>
                    </div>
                </button>
            {/if}
        {/each}
    </ul>
</div>
