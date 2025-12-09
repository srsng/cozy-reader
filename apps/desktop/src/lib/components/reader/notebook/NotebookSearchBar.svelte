<script lang="ts">
    import { Input } from '$lib/components/ui/input';
    import { Button } from '$lib/components/ui/button';
    import { Search, X } from 'lucide-svelte';
    import { bookDataStore } from '$lib/reader/stores/bookDataStore';
    import { notebookStore } from '$lib/reader/stores/notebookStore';
    import type { BookNote } from '$lib/reader/types';

    interface Props {
        isVisible: boolean;
        bookKey: string;
        onSearchResultChange: (results: BookNote[] | null) => void;
    }

    const { isVisible, bookKey, onSearchResultChange }: Props = $props();

    let searchTerm = $state('');
    let inputRef: HTMLInputElement | null = $state(null);
    let searchTimeout: ReturnType<typeof setTimeout> | null = null;

    $effect(() => {
        if (isVisible && inputRef) {
            inputRef.focus();
        }
    });

    const handleInputChange = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;
        searchTerm = value;

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        searchTimeout = setTimeout(() => {
            handleSearchTermChange(value);
        }, 300);
    };

    const handleClearSearch = () => {
        searchTerm = '';
        handleSearchTermChange('');
        inputRef?.focus();
    };

    const handleSearchTermChange = (term: string) => {
        if (term.trim().length >= 1) {
            const results = notebookStore.searchNotes(bookKey, term);
            onSearchResultChange(results);
        } else {
            onSearchResultChange(null);
        }
    };

    $effect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && inputRef) {
                inputRef.blur();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    });
</script>

{#if isVisible}
    <div class="relative px-3 py-2">
        <div class="bg-base-100 flex h-8 items-center rounded-lg">
            <div class="pl-3">
                <Search class="text-base-content/50 h-4 w-4" />
            </div>
            <input
                bind:this={inputRef}
                type="text"
                bind:value={searchTerm}
                oninput={handleInputChange}
                placeholder="搜索笔记和摘录..."
                class="w-full border-0 bg-transparent p-2 font-sans text-sm font-light focus-visible:outline-none focus-visible:ring-0"
            />
            {#if searchTerm}
                <div class="bg-base-300 flex h-8 w-8 items-center rounded-r-lg">
                    <Button
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8 rounded-none rounded-r-lg p-0"
                        onclick={handleClearSearch}
                    >
                        <X class="text-base-content/50 h-3 w-3" />
                    </Button>
                </div>
            {/if}
        </div>
    </div>
{/if}
