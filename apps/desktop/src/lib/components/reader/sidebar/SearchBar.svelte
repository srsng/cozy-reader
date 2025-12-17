<script lang="ts">
    import { onMount } from 'svelte';
    import { Input } from '$ui/input';
    import { Button } from '$ui/button';
    import { Search, ChevronDown } from '@lucide/svelte';
    import { sidebarStore } from '$lib/reader/stores/sidebarStore';
    import { bookDataStore } from '$lib/reader/stores/bookDataStore';
    import type { BookSearchConfig } from '$lib/reader/types';
    import * as DropdownMenu from '$ui/dropdown-menu';
    import SearchOptions from './SearchOptions.svelte';
    import { useSidebarSearch } from './useSidebarSearch.svelte';

    interface Props {
        isVisible: boolean;
        bookKey: string;
        onHideSearchBar: () => void;
    }

    const { isVisible, bookKey, onHideSearchBar }: Props = $props();

    let inputRef: HTMLInputElement | null = $state(null);
    let inputFocused = $state(false);

    // 使用 hook 管理搜索逻辑
    const searchHook = useSidebarSearch({ bookKey });

    // 使用 $state + $effect 响应式访问 store 的 searchTerm
    let searchTerm = $state(sidebarStore.getSearchTerm());

    $effect(() => {
        const unsubscribe = sidebarStore.subscribe((state) => {
            searchTerm = state.searchTerm;
        });
        return unsubscribe;
    });

    const searchConfig = $derived(searchHook.searchConfig);

    // 当搜索栏可见时，聚焦输入框
    $effect(() => {
        if (isVisible && inputRef) {
            inputRef.focus();
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
        sidebarStore.setSearchTerm(value);
    };

    const handleSearchConfigChange = (newConfig: BookSearchConfig) => {
        bookDataStore.setSearchConfig(bookKey, newConfig);
        // hook 会自动监听 searchConfig 变化并重新搜索
    };
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
