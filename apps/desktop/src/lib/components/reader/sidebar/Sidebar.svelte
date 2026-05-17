<script lang="ts">
    import type { Book } from '@cozy-reader/database';
    import { sidebarStore } from '$lib/reader/stores/sidebarStore';
    import { readerStore } from '$lib/reader/stores/readerStore';
    import { DrawerContent, DrawerHeader, DrawerClose } from '$ui/drawer';
    import { CommandAwareDrawerRoot } from '$lib/components/overlays';
    import { Button } from '$ui/button';
    import { Pin, PinOff, X } from '@lucide/svelte';
    import TabNavigation from './TabNavigation.svelte';
    import TOCView from './TOCView.svelte';
    import SearchBar from './SearchBar.svelte';
    import SearchResults from './SearchResults.svelte';
    import BooknoteView from './BooknoteView.svelte';
    import { useSidebarSearch } from './useSidebarSearch.svelte';
    import { cn } from '$utils';
    import * as Tabs from '$components/ui/tabs';

    interface Props {
        bookKey: string;
        book: Book;
    }

    const { bookKey, book }: Props = $props();

    // 使用 $state 和 $effect 从 store 中获取响应式状态
    let isVisible = $state(sidebarStore.getVisible());
    let currentTab = $state(sidebarStore.getCurrentTab());
    let isPinned = $state(sidebarStore.getPinned());
    let isSearchBarVisible = $state(sidebarStore.getSearchBarVisible());
    let searchResults = $state(sidebarStore.getSearchResults());

    const viewState = $derived(readerStore.getViewState(bookKey));
    const view = $derived(viewState?.view);

    // 订阅 sidebarStore 以响应状态变化
    $effect(() => {
        const unsubscribe = sidebarStore.subscribe((state) => {
            isVisible = state.isVisible;
            currentTab = state.currentTab;
            isPinned = state.isPinned;
            isSearchBarVisible = state.isSearchBarVisible;
            searchResults = state.searchResults;
        });
        return unsubscribe;
    });

    // 初始化搜索 hook，确保搜索逻辑正常工作
    useSidebarSearch({ bookKey });

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            sidebarStore.setVisible(false);
        }
        // 当侧边栏打开时，保持搜索结果状态（不清空）
        // 状态现在存储在 store 中，不会因为组件重新创建而丢失
    };

    const handleTabChange = (tab: typeof currentTab) => {
        sidebarStore.setCurrentTab(tab);
        // setCurrentTab 已经处理了搜索栏的显示/隐藏
        // 不清空搜索结果，保持状态以便切换回来时显示
    };

    const handleTogglePin = () => {
        sidebarStore.togglePinned();
        // 切换 pin 状态时，状态保持在 store 中，不会丢失
    };

    const handleHideSearchBar = () => {
        // 隐藏搜索栏时不清空搜索结果，保持状态以便再次打开时显示
        sidebarStore.setSearchBarVisible(false);
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

<CommandAwareDrawerRoot
    open={isVisible}
    onOpenChange={handleOpenChange}
    direction="left"
    modal={!isPinned}
>
    <DrawerContent
        noPortal={isPinned}
        class={cn(
            'bg-background h-full p-0',
            'transition-[width] duration-300 ease-in-out',
            isVisible ? 'w-80 max-w-[80vw]' : 'w-0',
            isPinned ? '' : 'mt-8',
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
                class="h-full flex-1 overflow-y-auto"
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
</CommandAwareDrawerRoot>
