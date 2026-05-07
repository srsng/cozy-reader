<script lang="ts">
    import { onMount } from 'svelte';
    import { Button } from '$ui/button';
    import { Card, CardContent } from '$ui/card';
    import { Badge } from '$ui/badge';
    import { Trash2 } from '@lucide/svelte';
    import { readerStore } from '$lib/reader/stores/readerStore';
    import { notebookStore } from '$lib/reader/stores/notebookStore';
    import { sidebarStore } from '$lib/reader/stores/sidebarStore';
    import type { BookNote } from '$lib/reader/types';

    interface Props {
        bookKey: string;
    }

    const { bookKey }: Props = $props();

    let notes = $state<BookNote[]>([]);

    // 使用 store 管理 selectedNoteId
    let selectedNoteId = $state(sidebarStore.getSelectedNoteId());

    const viewState = $derived(readerStore.getViewState(bookKey));
    const view = $derived(viewState?.view);
    const bookDoc = $derived(viewState?.bookDoc);
    const toc = $derived(bookDoc?.toc || []);

    // 订阅 notebookStore 获取笔记列表
    $effect(() => {
        const unsubscribe = notebookStore.subscribe((state) => {
            notes = state.notes[bookKey] || [];
        });
        return unsubscribe;
    });

    // 订阅 sidebarStore 获取选中的笔记 ID
    $effect(() => {
        const unsubscribe = sidebarStore.subscribe((state) => {
            selectedNoteId = state.selectedNoteId;
        });
        return unsubscribe;
    });

    onMount(() => {
        notebookStore.loadNotes(bookKey);
        notes = notebookStore.getNotesByBook(bookKey);
    });

    const handleNoteClick = async (note: BookNote) => {
        if (!view) return;
        // 使用 sidebarStore 管理选中状态
        sidebarStore.setSelectedNoteId(note.id);
        try {
            const resolved = view.resolveCFI(note.cfi);
            if (resolved) await view.goTo(resolved.index);
        } catch (error) {
            console.error('Failed to navigate to note:', error);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        await notebookStore.deleteNote(bookKey, noteId);
        notes = notebookStore.getNotesByBook(bookKey);
    };

    const getTypeLabel = (type: BookNote['type']) => {
        const labels: Record<BookNote['type'], string> = {
            highlight: '高亮',
            bookmark: '书签',
            note: '笔记',
            underline: '下划线',
            strike: '删除线',
            review: '评论'
        };
        return labels[type] || type;
    };

    const groupedNotes = $derived(() => {
        return notebookStore.getNotesGroupedBySection(
            bookKey,
            toc.map((item) => ({
                id: item.id || 0,
                href: item.href || '',
                label: item.label || ''
            }))
        );
    });
</script>

<div class="flex h-full flex-col overflow-hidden">
    {#if notes.length === 0}
        <div class="flex flex-1 items-center justify-center p-4" role="status" aria-live="polite">
            <span class="text-muted-foreground text-sm">暂无笔记</span>
        </div>
    {:else}
        <div class="flex-1 overflow-y-auto p-4" role="list" aria-label="笔记列表">
            {#each groupedNotes() as group (group.id)}
                {#if group.booknotes.length > 0}
                    <div class="mb-4">
                        <h3 class="text-muted-foreground mb-2 text-sm font-semibold">
                            {group.label}
                        </h3>
                        <div class="space-y-2">
                            {#each group.booknotes as note (note.id)}
                                <Card
                                    class="transition-colors {selectedNoteId === note.id
                                        ? 'bg-accent'
                                        : ''}"
                                    role="listitem"
                                >
                                    <CardContent class="flex items-start justify-between gap-2 p-3">
                                        <button
                                            type="button"
                                            class="flex-1 cursor-pointer text-left"
                                            onclick={() => handleNoteClick(note)}
                                            aria-label="跳转到笔记位置"
                                        >
                                            <div class="space-y-1">
                                                {#if note.text}
                                                    <p class="line-clamp-2 text-sm">{note.text}</p>
                                                {/if}
                                                {#if note.note}
                                                    <p class="text-muted-foreground text-xs">
                                                        {note.note}
                                                    </p>
                                                {/if}
                                                <Badge variant="secondary" class="text-xs">
                                                    {getTypeLabel(note.type)}
                                                </Badge>
                                            </div>
                                        </button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onclick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteNote(note.id);
                                            }}
                                            aria-label="删除笔记"
                                            class="h-6 w-6 shrink-0"
                                        >
                                            <Trash2 class="h-4 w-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            {/each}
                        </div>
                    </div>
                {/if}
            {/each}
        </div>
    {/if}
</div>
