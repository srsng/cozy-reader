<script lang="ts">
    import { Card, CardContent } from '$lib/components/ui/card';
    import { Button } from '$lib/components/ui/button';
    import { Textarea } from '$lib/components/ui/textarea';
    import { SquarePen, Trash2 } from 'lucide-svelte';
    import { readerStore } from '$lib/reader/stores/readerStore';
    import { notebookStore } from '$lib/reader/stores/notebookStore';
    import { annotationService } from '$lib/reader/services/AnnotationService';
    import type { BookNote } from '$lib/reader/types';

    interface Props {
        bookKey: string;
        item: BookNote;
    }

    const { bookKey, item }: Props = $props();

    const viewState = $derived(readerStore.getViewState(bookKey));
    const view = $derived(viewState?.view);
    const progress = $derived(viewState?.progress);
    // 检查当前进度是否匹配笔记位置（通过 section 或其他方式）
    const isCurrent = $derived(false); // TODO: 实现位置匹配逻辑

    let inlineEditMode = $state(false);
    let editorDraft = $state(item.text || '');

    const handleClickItem = async () => {
        if (!view) return;
        try {
            const resolved = view.resolveCFI?.(item.cfi);
            if (resolved) {
                await view.goTo?.(resolved.index);
            }
            if (item.note) {
                notebookStore.setVisible(true);
            }
        } catch (error) {
            console.error('Failed to navigate to note:', error);
        }
    };

    const handleDeleteNote = async () => {
        try {
            await annotationService.deleteAnnotation(bookKey, item.cfi);
            await notebookStore.loadNotesFromDatabase(bookKey);
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    const handleEditNote = () => {
        notebookStore.setVisible(true);
        notebookStore.setEditAnnotation(item);
    };

    const handleEditBookmark = () => {
        editorDraft = item.text || '';
        inlineEditMode = true;
    };

    const handleSaveBookmark = async () => {
        inlineEditMode = false;
        try {
            await annotationService.updateAnnotation(bookKey, item.id, {
                text: editorDraft
            });
            await notebookStore.loadNotesFromDatabase(bookKey);
        } catch (error) {
            console.error('Failed to save bookmark:', error);
        }
    };
</script>

{#if inlineEditMode}
    <Card
        class="border-base-300 content group relative my-2 cursor-pointer rounded-lg border p-2 {isCurrent
            ? 'bg-base-300/85 hover:bg-base-300'
            : 'hover:bg-base-300/55 bg-base-100'} transition-all duration-300 ease-in-out"
    >
        <CardContent class="flex w-full flex-col p-0">
            <Textarea
                bind:value={editorDraft}
                onkeydown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        handleSaveBookmark();
                    } else if (e.key === 'Escape') {
                        inlineEditMode = false;
                    }
                }}
                spellcheck={false}
                class="min-h-[60px] resize-none"
            />
            <div class="flex justify-end gap-3 p-2" dir="ltr">
                <Button variant="ghost" onclick={() => (inlineEditMode = false)}>取消</Button>
                <Button onclick={handleSaveBookmark} disabled={!editorDraft}>保存</Button>
            </div>
        </CardContent>
    </Card>
{:else}
    <Card
        class="border-base-300 content group relative my-2 cursor-pointer rounded-lg border p-2 {isCurrent
            ? 'bg-base-300/85 hover:bg-base-300 focus:bg-base-300'
            : 'hover:bg-base-300/55 focus:bg-base-300/55 bg-base-100'} transition-all duration-300 ease-in-out"
        role="button"
        tabindex={0}
        onclick={handleClickItem}
        onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleClickItem();
            }
        }}
    >
        <CardContent class="min-h-4 p-0 transition-all duration-300 ease-in-out">
            {#if item.note}
                <div class="content prose prose-sm text-sm" dir="auto">
                    {@html item.note}
                </div>
            {/if}
            <div class="flex items-start">
                {#if item.note}
                    <div
                        class="me-2 mt-2.5 min-h-full self-stretch rounded-xl bg-gray-300"
                        style="min-width: 3px;"
                    ></div>
                {/if}
                <div class="content line-clamp-3 text-sm {item.note ? 'mt-2' : ''}">
                    <span
                        class="inline leading-normal {item.note
                            ? 'content text-xs text-gray-500'
                            : ''}"
                    >
                        {item.text || ''}
                    </span>
                </div>
            </div>
        </CardContent>
        <div
            class="max-h-0 overflow-hidden p-0 transition-[max-height] duration-300 ease-in-out group-focus-within:max-h-8 group-focus-within:overflow-visible group-hover:max-h-8 group-hover:overflow-visible"
            role="none"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
        >
            <div class="flex cursor-default items-center justify-between">
                <div class="flex items-center">
                    <span class="text-xs text-gray-500 sm:text-xs">
                        {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <div class="flex items-center justify-end gap-3 p-2" dir="ltr">
                    {#if item.note || item.type === 'bookmark'}
                        <Button
                            variant="ghost"
                            size="sm"
                            onclick={(e) => {
                                e.stopPropagation();
                                item.type === 'bookmark' ? handleEditBookmark() : handleEditNote();
                            }}
                            class="opacity-0 transition duration-300 ease-in-out group-focus-within:opacity-100 group-hover:opacity-100"
                        >
                            <SquarePen class="h-4 w-4" />
                        </Button>
                    {/if}
                    <Button
                        variant="ghost"
                        size="sm"
                        onclick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote();
                        }}
                        class="opacity-0 transition duration-300 ease-in-out group-focus-within:opacity-100 group-hover:opacity-100"
                    >
                        <Trash2 class="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    </Card>
{/if}
