<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { Input } from '$ui/input';
    import { Button } from '$ui/button';
    import { Search, ChevronDown } from '@lucide/svelte';
    import { readerStore } from '$lib/reader/stores/readerStore';
    import { bookDataStore } from '$lib/reader/stores/bookDataStore';
    import type { BookSearchConfig, BookSearchResult } from '$lib/reader/types';
    import { debounce } from '$lib/reader/utils/debounce';
    import { isCJKStr } from '$lib/reader/utils/lang';
    import { createRejectFilter } from '$lib/reader/utils/node';
    import * as DropdownMenu from '$ui/dropdown-menu';
    import SearchOptions from './SearchOptions.svelte';

    interface Props {
        isVisible: boolean;
        bookKey: string;
        searchTerm: string;
        onSearchResultChange: (results: BookSearchResult[]) => void;
        onHideSearchBar: () => void;
    }

    const {
        isVisible,
        bookKey,
        searchTerm: term,
        onSearchResultChange,
        onHideSearchBar
    }: Props = $props();

    const MINIMUM_SEARCH_TERM_LENGTH_DEFAULT = 2;
    const MINIMUM_SEARCH_TERM_LENGTH_CJK = 1;

    let searchTerm = $state(term);
    let queuedSearchTerm = $state('');
    let inputRef: HTMLInputElement | null = $state(null);
    let inputFocused = $state(false);

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

    // 当 bookKey 变化时，重新搜索
    $effect(() => {
        if (bookKey && searchTerm) {
            handleSearchTermChange(searchTerm);
        }
    });

    // 当外部 searchTerm 变化时，同步并搜索
    $effect(() => {
        searchTerm = term;
        handleSearchTermChange(term);
    });

    // 当搜索栏可见时，聚焦输入框
    $effect(() => {
        if (isVisible && inputRef) {
            inputRef.focus();
        }
        if (isVisible && searchTerm) {
            handleSearchTermChange(searchTerm);
        }
    });

    // Escape 键处理
    onMount(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (inputRef && inputFocused) {
                    inputRef.blur();
                } else {
                    onHideSearchBar();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    });

    const handleInputChange = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;
        searchTerm = value;
        handleSearchTermChange(value);
        queuedSearchTerm = value;
    };

    const handleSearchConfigChange = (newConfig: BookSearchConfig) => {
        bookDataStore.setSearchConfig(bookKey, newConfig);
        handleSearchTermChange(searchTerm);
    };

    const exceedMinSearchTermLength = (searchTerm: string) => {
        const minLength = isCJKStr(searchTerm)
            ? MINIMUM_SEARCH_TERM_LENGTH_CJK
            : MINIMUM_SEARCH_TERM_LENGTH_DEFAULT;
        return searchTerm.length >= minLength;
    };

    const handleSearch = async (term: string) => {
        if (!view || !term) return;

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
                    if (typeof result === 'string') {
                        if (result === 'done') {
                            onSearchResultChange([...results]);
                            console.log('search done');
                        }
                    } else {
                        if (result.progress) {
                            const now = Date.now();
                            if (now - lastProgressLogTime >= 1000) {
                                console.log('search progress:', result.progress);
                                lastProgressLogTime = now;
                            }
                            if (queuedSearchTerm && queuedSearchTerm !== term) {
                                console.log('search term changed, resetting search');
                                resetSearch();
                                return;
                            }
                        } else {
                            results.push(result);
                            onSearchResultChange([...results]);
                        }
                    }

                    await new Promise((resolve) => setTimeout(resolve, 0));
                }
            };

            processResults();
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const resetSearch = () => {
        onSearchResultChange([]);
        view?.clearSearch();
    };

    const handleSearchTermChange = debounce((term: string) => {
        if (exceedMinSearchTermLength(term)) {
            handleSearch(term);
        } else {
            resetSearch();
        }
    }, 500);
</script>

<div class="relative p-2">
    <div class="bg-background flex h-8 items-center rounded-lg border">
        <div class="pl-3">
            <Search class="text-muted-foreground h-4 w-4" />
        </div>

        <input
            bind:this={inputRef}
            type="text"
            value={searchTerm}
            spellcheck={false}
            oninput={handleInputChange}
            onfocus={() => (inputFocused = true)}
            onblur={() => (inputFocused = false)}
            placeholder="搜索..."
            class="w-full bg-transparent p-2 text-sm focus:outline-none"
        />

        <div class="bg-muted flex h-8 w-8 items-center rounded-r-lg">
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <Button variant="ghost" size="icon" class="h-8 w-8 rounded-none rounded-r-lg">
                        <ChevronDown class="text-muted-foreground h-3 w-3" />
                    </Button>
                </DropdownMenu.Trigger>
                <SearchOptions {searchConfig} onSearchConfigChanged={handleSearchConfigChange} />
            </DropdownMenu.Root>
        </div>
    </div>
</div>
