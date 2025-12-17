/**
 * useSidebarSearch Hook
 * 使用 svelte5 runes 管理侧边栏搜索逻辑
 */

import { untrack } from 'svelte';
import { sidebarStore } from '$lib/reader/stores/sidebarStore';
import { readerStore } from '$lib/reader/stores/readerStore';
import { bookDataStore } from '$lib/reader/stores/bookDataStore';
import type { BookSearchConfig, BookSearchResult } from '$lib/reader/types';
import { debounce } from '$lib/reader/utils/debounce';
import { isCJKStr } from '$lib/reader/utils/lang';
import { createRejectFilter } from '$lib/reader/utils/node';

const MINIMUM_SEARCH_TERM_LENGTH_DEFAULT = 2;
const MINIMUM_SEARCH_TERM_LENGTH_CJK = 1;
const SEARCH_DEBOUNCE_DELAY = 500;

interface UseSidebarSearchOptions {
    bookKey: string;
}

export function useSidebarSearch(options: UseSidebarSearchOptions) {
    const { bookKey } = options;

    // 当前正在执行的搜索 term，用于取消旧的搜索
    let currentSearchTerm = $state<string | null>(null);
    let isSearching = $state(false);
    let searchAbortController: AbortController | null = $state(null);
    let lastProcessedSearchTerm = $state<string>('');
    let lastSearchConfig = $state<BookSearchConfig | null>(null);

    const viewState = $derived(readerStore.getViewState(bookKey));
    const view = $derived(viewState?.view);
    const bookData = $derived(bookDataStore.getBookData(bookKey));
    const progress = $derived(viewState?.progress);
    const config = $derived(bookDataStore.getConfig(bookKey));

    const primaryLang = $derived(
        bookData?.bookDoc?.metadata?.language
            ? Array.isArray(bookData.bookDoc.metadata.language)
                ? bookData.bookDoc.metadata.language[0] || 'en'
                : typeof bookData.bookDoc.metadata.language === 'string'
                    ? bookData.bookDoc.metadata.language
                    : 'en'
            : 'en'
    );

    const searchConfig = $derived(
        (config?.searchConfig as BookSearchConfig) || {
            scope: 'section',
            matchCase: false,
            matchWholeWords: false,
            matchDiacritics: false
        }
    );

    /**
     * 检查搜索词是否达到最小长度
     */
    const exceedMinSearchTermLength = (term: string): boolean => {
        const minLength = isCJKStr(term)
            ? MINIMUM_SEARCH_TERM_LENGTH_CJK
            : MINIMUM_SEARCH_TERM_LENGTH_DEFAULT;
        return term.length >= minLength;
    };

    /**
     * 重置搜索
     */
    const resetSearch = () => {
        // 使用 untrack 避免读取 searchResults 时被当作依赖
        const currentResults = untrack(() => sidebarStore.getSearchResults());
        if (currentResults && currentResults.length > 0) {
            sidebarStore.setSearchResults([]);
        }
        view?.clearSearch();
        currentSearchTerm = null;
        isSearching = false;
        if (searchAbortController) {
            searchAbortController.abort();
            searchAbortController = null;
        }
    };

    /**
     * 执行搜索
     */
    const performSearch = async (term: string) => {
        if (!view || !term) {
            resetSearch();
            return;
        }

        // 如果已经有正在进行的搜索，取消它
        if (searchAbortController) {
            searchAbortController.abort();
        }

        // 创建新的 AbortController 用于取消搜索
        searchAbortController = new AbortController();
        const signal = searchAbortController.signal;

        currentSearchTerm = term;
        isSearching = true;

        // 清空之前的结果
        sidebarStore.setSearchResults([]);

        console.log('searching for:', term);

        const section = progress?.section;
        const index = searchConfig.scope === 'section' ? section?.current : undefined;

        try {
            const generator = view.search({
                ...searchConfig,
                index,
                query: term,
                acceptNode: createRejectFilter({
                    tags: primaryLang.startsWith('ja') ? ['rt'] : []
                })
            });

            const results: BookSearchResult[] = [];
            let lastProgressLogTime = 0;

            const processResults = async () => {
                for await (const result of generator) {
                    // 检查是否已取消
                    if (signal.aborted) {
                        console.log('search cancelled');
                        return;
                    }

                    // 检查搜索词是否已更改
                    if (currentSearchTerm !== term) {
                        console.log('search term changed, aborting');
                        return;
                    }

                    if (typeof result === 'string') {
                        if (result === 'done') {
                            sidebarStore.setSearchResults([...results]);
                            console.log('search done');
                            isSearching = false;
                        }
                    } else {
                        if (result.progress) {
                            const now = Date.now();
                            if (now - lastProgressLogTime >= 1000) {
                                console.log('search progress:', result.progress);
                                lastProgressLogTime = now;
                            }
                        } else {
                            results.push(result);
                            sidebarStore.setSearchResults([...results]);
                        }
                    }

                    await new Promise((resolve) => setTimeout(resolve, 0));
                }
            };

            await processResults();
        } catch (error) {
            if (signal.aborted) {
                console.log('search was cancelled');
            } else {
                console.error('Search error:', error);
                isSearching = false;
            }
        } finally {
            if (currentSearchTerm === term) {
                searchAbortController = null;
            }
        }
    };

    /**
     * 处理搜索词变化（带防抖）
     */
    const handleSearchTermChange = debounce((term: string) => {
        if (exceedMinSearchTermLength(term)) {
            performSearch(term);
        } else {
            resetSearch();
        }
    }, SEARCH_DEBOUNCE_DELAY);

    /**
     * 监听 store 中的 searchTerm 变化并触发搜索
     */
    $effect(() => {
        const unsubscribe = sidebarStore.subscribe((state) => {
            const term = state.searchTerm;
            // 避免重复处理相同的搜索词
            if (term === lastProcessedSearchTerm) {
                return;
            }
            lastProcessedSearchTerm = term;

            if (bookKey && term) {
                handleSearchTermChange(term);
            } else if (!term) {
                // 使用 untrack 避免读取 searchResults 时被当作依赖
                const hasResults = untrack(() => sidebarStore.getSearchResults()?.length);
                if (hasResults) {
                    resetSearch();
                }
            }
        });
        return unsubscribe;
    });

    /**
     * 监听搜索配置变化，如果已有搜索词则重新搜索
     */
    $effect(() => {
        const config = searchConfig;
        // 使用 untrack 避免读取 searchTerm 时被当作依赖（因为 searchTerm 变化已经有单独的 effect 处理）
        const term = untrack(() => sidebarStore.getSearchTerm());

        // 检查配置是否真的变化了
        if (lastSearchConfig &&
            lastSearchConfig.scope === config.scope &&
            lastSearchConfig.matchCase === config.matchCase &&
            lastSearchConfig.matchWholeWords === config.matchWholeWords &&
            lastSearchConfig.matchDiacritics === config.matchDiacritics) {
            return;
        }

        lastSearchConfig = { ...config };

        if (bookKey && term && exceedMinSearchTermLength(term)) {
            // 取消当前的防抖，立即执行搜索
            handleSearchTermChange.cancel();
            performSearch(term);
        }
    });

    return {
        get searchTerm() {
            // 返回一个可以在组件中使用 $derived.by() 包装的值
            // 组件中应该使用 $derived.by(() => searchHook.searchTerm) 来响应式访问
            return sidebarStore.getSearchTerm();
        },
        get isSearching() {
            return isSearching;
        },
        get searchConfig() {
            return searchConfig;
        },
        handleSearchTermChange,
        resetSearch,
        performSearch
    };
}

