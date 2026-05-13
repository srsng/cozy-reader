<script lang="ts">
    import { Textarea } from '$lib/components/ui/textarea';
    import { Button } from '$lib/components/ui/button';
    import { notebookStore } from '$lib/reader/stores/notebookStore';
    import { annotationService } from '$lib/reader/services/AnnotationService';
    import type { BookNote } from '$lib/reader/types';
    import type { TextSelection } from '$lib/reader/utils/sel';

    interface Props {
        bookKey: string;
        onSave: (selection: TextSelection, note: string) => void;
        onEdit: (annotation: BookNote) => void;
    }

    const { bookKey, onSave, onEdit }: Props = $props();

    const notebookNewAnnotation = $derived(notebookStore.getNewAnnotation());
    const notebookEditAnnotation = $derived(notebookStore.getEditAnnotation());

    let note = $state('');
    let textareaRef: HTMLTextAreaElement | null = $state(null);

    const getAnnotationText = () => {
        return notebookEditAnnotation?.text || notebookNewAnnotation?.text || '';
    };

    $effect(() => {
        if (notebookEditAnnotation) {
            note = notebookEditAnnotation.note || '';
            setTimeout(() => {
                textareaRef?.focus();
            }, 0);
        } else if (notebookNewAnnotation) {
            note = '';
            setTimeout(() => {
                textareaRef?.focus();
            }, 0);
        }
    });

    const handleNoteChange = (e: Event) => {
        note = (e.target as HTMLTextAreaElement).value;
    };

    const handleSaveNote = async () => {
        const currentValue = note.trim();
        if (!currentValue) return;

        if (notebookNewAnnotation) {
            onSave(notebookNewAnnotation, currentValue);
        } else if (notebookEditAnnotation) {
            const updatedNote: BookNote = {
                ...notebookEditAnnotation,
                note: currentValue,
                updatedAt: Date.now()
            };
            onEdit(updatedNote);
        }
    };

    const handleEscape = () => {
        notebookStore.setNewAnnotation(null);
        notebookStore.setEditAnnotation(null);
    };

    // 处理按键绑定
    $effect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleEscape();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSaveNote();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    });

    const canSave = $derived(Boolean(note.trim()));
    const annotationText = $derived(getAnnotationText());
</script>

<div class="content note-editor-container bg-base-100 mt-2 rounded-md p-2">
    <div class="flex w-full">
        <textarea
            bind:this={textareaRef}
            bind:value={note}
            oninput={handleNoteChange}
            placeholder="在此添加您的笔记..."
            spellcheck={false}
            class="border-input focus-visible:ring-ring min-h-[100px] w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
        ></textarea>
    </div>

    {#if annotationText}
        <div class="flex items-center pt-2">
            <div
                class="me-2 mt-0.5 min-h-full self-stretch rounded-xl bg-gray-300"
                style="min-width: 3px;"
            ></div>
            <div class="content line-clamp-3 text-sm">
                <span class="content text-xs text-gray-500">{annotationText}</span>
            </div>
        </div>
    {/if}

    <div class="flex justify-end gap-3 p-2" dir="ltr">
        <Button variant="ghost" onclick={handleEscape}>取消</Button>
        <Button onclick={handleSaveNote} disabled={!canSave}>保存</Button>
    </div>
</div>
