<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { Drawer, DrawerContent, DrawerOverlay } from '$lib/components/ui/drawer';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent } from '$lib/components/ui/card';
    import { readerStore } from '$lib/reader/stores/readerStore';
    import { notebookStore } from '$lib/reader/stores/notebookStore';
    import { sidebarStore } from '$lib/reader/stores/sidebarStore';
    import { bookDataStore } from '$lib/reader/stores/bookDataStore';
    import { annotationService } from '$lib/reader/services/AnnotationService';
    import NotebookHeader from './NotebookHeader.svelte';
    import NotebookSearchBar from './NotebookSearchBar.svelte';
    import NoteEditor from './NoteEditor.svelte';
    import BooknoteItem from './BooknoteItem.svelte';
    import type { BookNote } from '$lib/reader/types';
    import type { TextSelection } from '$lib/reader/utils/sel';

    interface Props {
        bookKey: string;
    }

    const { bookKey }: Props = $props();

    const MIN_NOTEBOOK_WIDTH = 0.15;
    const MAX_NOTEBOOK_WIDTH = 0.45;

    let isVisible = $state(notebookStore.getVisible());
    let isPinned = $state(notebookStore.getPinned());
    let isSearchBarVisible = $state(false);
    let searchResults = $state<BookNote[] | null>(null);
    let notebookWidth = $state(notebookStore.getNotebookWidth());

    const viewState = $derived(readerStore.getViewState(bookKey));
    const view = $derived(viewState?.view);
    const readerSettings = $derived(viewState?.readerSettings);
    const bookData = $derived(bookDataStore.getBookData(bookKey));
    const bookDoc = $derived(bookData?.bookDoc);
    const notebookNewAnnotation = $derived(notebookStore.getNewAnnotation());
    const notebookEditAnnotation = $derived(notebookStore.getEditAnnotation());

    // 订阅 notebookStore
    const unsubscribe = notebookStore.subscribe((state) => {
        isVisible = state.isVisible;
        isPinned = state.isPinned;
        notebookWidth = state.notebookWidth;
    });

    const notes = $derived(notebookStore.getNotesByBook(bookKey));
    const annotationNotes = $derived(
        notes
            .filter((note) => note.type === 'note' && note.note && !note.deletedAt)
            .sort((a, b) => b.createdAt - a.createdAt)
    );
    // 摘录笔记（没有 note 内容的高亮/书签）
    const excerptNotes = $derived(
        notes
            .filter((note) => !note.note && note.text && !note.deletedAt)
            .sort((a, b) => a.createdAt - b.createdAt)
    );

    const filteredAnnotationNotes = $derived(
        isSearchBarVisible && searchResults
            ? searchResults.filter((note) => note.type === 'note' && note.note && !note.deletedAt)
            : annotationNotes
    );

    const filteredExcerptNotes = $derived(
        isSearchBarVisible && searchResults
            ? searchResults.filter((note) => !note.note && note.text && !note.deletedAt)
            : excerptNotes
    );

    const hasSearchResults = $derived(
        filteredAnnotationNotes.length > 0 || filteredExcerptNotes.length > 0
    );
    const hasAnyNotes = $derived(annotationNotes.length > 0 || excerptNotes.length > 0);

    const handleClose = () => {
        notebookStore.setVisible(false);
        notebookStore.setNewAnnotation(null);
        notebookStore.setEditAnnotation(null);
    };

    const handleTogglePin = () => {
        notebookStore.togglePinned();
    };

    const handleToggleSearchBar = () => {
        isSearchBarVisible = !isSearchBarVisible;
        if (!isSearchBarVisible) {
            searchResults = null;
        }
    };

    const handleClickOverlay = () => {
        if (!isPinned) {
            notebookStore.setVisible(false);
            notebookStore.setNewAnnotation(null);
            notebookStore.setEditAnnotation(null);
        }
    };

    const handleSaveNote = async (selection: TextSelection, note: string) => {
        if (!view) return;

        try {
            const cfi = view.getCFI?.(selection.index, selection.range);
            if (!cfi) return;

            const bookId = bookData?.book?.id;
            if (!bookId) return;

            // 创建注释
            const bookNote: BookNote = {
                id: `${Date.now()}-${Math.random()}`,
                type: 'note',
                cfi,
                text: selection.text,
                note: note,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            await annotationService.saveAnnotation(bookKey, bookNote);

            // 重新加载笔记
            await notebookStore.loadNotesFromDatabase(bookKey);

            notebookStore.setNewAnnotation(null);
        } catch (error) {
            console.error('Failed to save note:', error);
        }
    };

    const handleEditNote = async (note: BookNote) => {
        if (!bookData?.book?.id) return;

        try {
            await annotationService.updateAnnotation(bookKey, note.id, {
                note: note.note
            });

            await notebookStore.loadNotesFromDatabase(bookKey);
            notebookStore.setEditAnnotation(null);
        } catch (error) {
            console.error('Failed to edit note:', error);
        }
    };

    // 处理导航事件
    const handleNavigate = () => {
        if (!isPinned) {
            notebookStore.setVisible(false);
        }
    };

    onMount(() => {
        notebookStore.loadNotesFromDatabase(bookKey);
        window.addEventListener('navigate', handleNavigate);
        return () => {
            window.removeEventListener('navigate', handleNavigate);
        };
    });

    onDestroy(() => {
        unsubscribe();
    });
</script>

<Drawer
    open={isVisible}
    onOpenChange={(open) => !open && handleClose()}
    direction="right"
    modal={!isPinned}
>
    {#if !isPinned}
        <DrawerOverlay onclick={handleClickOverlay} />
    {/if}
    <DrawerContent
        class="bg-base-200 h-full {isPinned ? 'w-[30%]' : 'w-80'} max-w-[80vw] p-0"
        style="width: {notebookWidth};"
    >
        <div class="flex h-full flex-col">
            <NotebookHeader
                {isPinned}
                {isSearchBarVisible}
                onClose={handleClose}
                onTogglePin={handleTogglePin}
                onToggleSearchBar={handleToggleSearchBar}
            />
            <NotebookSearchBar
                isVisible={isSearchBarVisible}
                {bookKey}
                onSearchResultChange={(results) => (searchResults = results)}
            />
            <div class="flex-grow overflow-y-auto px-3">
                {#if isSearchBarVisible && searchResults && !hasSearchResults && hasAnyNotes}
                    <div class="flex h-32 items-center justify-center text-gray-500">
                        <p class="text-center text-sm">没有匹配的笔记</p>
                    </div>
                {/if}
                <div dir="ltr">
                    {#if filteredExcerptNotes.length > 0}
                        <p class="content text-base">
                            摘录
                            {#if isSearchBarVisible && searchResults}
                                <span class="ml-2 text-xs text-gray-500"
                                    >({filteredExcerptNotes.length})</span
                                >
                            {/if}
                        </p>
                    {/if}
                </div>
                <ul>
                    {#each filteredExcerptNotes as item (item.id)}
                        <li class="my-2">
                            <Card class="border-base-300 bg-base-100 cursor-pointer border">
                                <CardContent class="p-2">
                                    <p class="line-clamp-1 text-sm font-medium">
                                        {item.text || `摘录 ${item.id}`}
                                    </p>
                                    <div class="mt-2 select-text px-3 pb-0 text-xs">
                                        <p class="hyphens-auto text-justify">{item.text}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </li>
                    {/each}
                </ul>
                <div dir="ltr">
                    {#if notebookNewAnnotation || filteredAnnotationNotes.length > 0}
                        <p class="content text-base">
                            笔记
                            {#if isSearchBarVisible && searchResults && filteredAnnotationNotes.length > 0}
                                <span class="ml-2 text-xs text-gray-500"
                                    >({filteredAnnotationNotes.length})</span
                                >
                            {/if}
                        </p>
                    {/if}
                </div>
                {#if (notebookNewAnnotation || notebookEditAnnotation) && !isSearchBarVisible}
                    <NoteEditor {bookKey} onSave={handleSaveNote} onEdit={handleEditNote} />
                {/if}
                <ul>
                    {#each filteredAnnotationNotes as item (item.id)}
                        <BooknoteItem {bookKey} {item} />
                    {/each}
                </ul>
            </div>
        </div>
    </DrawerContent>
</Drawer>
