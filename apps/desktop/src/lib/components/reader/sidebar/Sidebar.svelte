<script lang="ts">
    import type { Book } from '@cozy-reader/database';
    import { sidebarStore } from '$lib/reader/stores/sidebarStore';
    import { readerStore } from '$lib/reader/stores/readerStore';
    import { Drawer, DrawerContent, DrawerHeader, DrawerClose } from '$ui/drawer';
    import { Button } from '$ui/button';
    import { Pin, PinOff, X } from '@lucide/svelte';
    import TabNavigation from './TabNavigation.svelte';
    import TOCView from './TOCView.svelte';
    import SearchBar from './SearchBar.svelte';
    import SearchResults from './SearchResults.svelte';
    import BooknoteView from './BooknoteView.svelte';
    import type { BookSearchResult } from '$lib/reader/types';
    import { cn } from '$utils';
    import * as Tabs from '$components/ui/tabs';

    interface Props {
        bookKey: string;
        book: Book;
    }

    const { bookKey, book }: Props = $props();

    let isVisible = $state(sidebarStore.getVisible());
    let currentTab = $state(sidebarStore.getCurrentTab());
    let isPinned = $state(sidebarStore.getPinned());
    let isSearchBarVisible = $state(false);
    let searchResults = $state<BookSearchResult[] | null>(null);
    let searchTerm = $state('');

    const viewState = $derived(readerStore.getViewState(bookKey));
    const view = $derived(viewState?.view);

    // 订阅 sidebarStore
    const unsubscribe = sidebarStore.subscribe((state) => {
        isVisible = state.isVisible;
        currentTab = state.currentTab;
        isPinned = state.isPinned;
        // 当切换到搜索标签时，显示搜索栏
        if (state.currentTab === 'search') {
            isSearchBarVisible = true;
        }
    });

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            sidebarStore.setVisible(false);
        } else {
            // 当侧边栏打开时，保持搜索结果状态（不清空）
            // 只有在切换标签或用户明确清除时才清空搜索结果
        }
    };

    const handleTabChange = (tab: typeof currentTab) => {
        sidebarStore.setCurrentTab(tab);
        if (tab === 'search') {
            isSearchBarVisible = true;
            // 切换到搜索标签时，不清空已有搜索结果
        } else {
            isSearchBarVisible = false;
            // 切换到其他标签时才清空搜索结果
            searchResults = null;
        }
    };

    const handleTogglePin = () => {
        sidebarStore.togglePinned();
    };

    const handleSearchResultChange = (results: BookSearchResult[]) => {
        searchResults = results;
    };

    const handleHideSearchBar = () => {
        // 隐藏搜索栏时不清空搜索结果，保持状态以便再次打开时显示
        isSearchBarVisible = false;
        // 不清空 searchResults，保持搜索结果状态
        // 不清空 searchTerm，保持搜索词状态
        // 不清除搜索高亮，保持高亮显示
    };

    const handleSearchResultClick = (cfi: string) => {
        if (!view) return;
        view.goTo(cfi);
        // 不自动关闭侧边栏，让用户手动控制
    };
</script>

<Drawer bind:open={isVisible} onOpenChange={handleOpenChange} direction="left" modal={!isPinned}>
    <DrawerContent
        noPortal={isPinned}
        class={cn(
            'bg-background p-0',
            'transition-[width] duration-300 ease-in-out',
            isVisible ? 'w-80 max-w-[80vw]' : 'w-0',
            isPinned ? 'h-full' : 'mt-8 h-full',
            isPinned && 'overflow-hidden'
        )}
    >
        <div class="flex h-full flex-col overflow-hidden bg-transparent">
            <!-- 侧边栏头部 -->
            <DrawerHeader class="flex h-11 flex-row items-center justify-between border-b px-4">
                <TabNavigation {currentTab} onTabChange={handleTabChange} />
                <div class="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onclick={handleTogglePin}
                        title={isPinned ? '取消固定' : '固定'}
                        aria-label={isPinned ? '取消固定' : '固定'}
                    >
                        {#if isPinned}
                            <Pin class="h-5 w-5" />
                        {:else}
                            <PinOff class="h-5 w-5" />
                        {/if}
                    </Button>
                    <DrawerClose>
                        <Button
                            variant="ghost"
                            size="sm"
                            title="关闭侧边栏"
                            aria-label="关闭侧边栏"
                        >
                            <X class="h-5 w-5" />
                        </Button>
                    </DrawerClose>
                </div>
            </DrawerHeader>

            <!-- 侧边栏内容 -->
            <div
                class="flex-1 overflow-y-auto"
                role="region"
                aria-label={currentTab === 'toc'
                    ? '目录'
                    : currentTab === 'search'
                      ? '搜索'
                      : '笔记'}
            >
                {#if currentTab === 'toc'}
                    <TOCView {bookKey} />
                {:else if currentTab === 'search'}
                    <div class="flex h-full flex-col">
                        <SearchBar
                            isVisible={isSearchBarVisible}
                            {bookKey}
                            {searchTerm}
                            onSearchResultChange={handleSearchResultChange}
                            onHideSearchBar={handleHideSearchBar}
                        />
                        <SearchResults
                            {bookKey}
                            results={searchResults ?? []}
                            onSelectResult={handleSearchResultClick}
                        />
                    </div>
                {:else if currentTab === 'notes'}
                    <BooknoteView {bookKey} />
                {/if}
            </div>
        </div>
    </DrawerContent>
</Drawer>
