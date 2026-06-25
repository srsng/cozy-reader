<script lang="ts">
    import type { Book } from '@cozy-reader/database';
    import { Trash2 } from 'lucide-svelte';
    import { cn } from '$lib/utils.js';

    interface Props {
        book: Book;
        onOpen: () => void;
        onDelete?: () => void;
        class?: string;
    }

    const coverPalette = [
        '#BC5377',
        '#B04C63',
        '#B25564',
        '#C15859',
        '#BF6150',
        '#C76849',
        '#C57140',
        '#C68245',
        '#D0953E',
        '#DAB062',
        '#D9AB60',
        '#C4AC58',
        '#B6AC56',
        '#B0BB6D',
        '#969F68',
        '#83A86B',
        '#69A076',
        '#5CA58A',
        '#47938F',
        '#3C8585',
        '#6B7096'
    ] as const;

    let { book, onOpen, onDelete, class: className = '' }: Props = $props();

    const displayTitle = $derived.by(() => formatTitle(book.title));
    const displayAuthor = $derived.by(() => formatAuthor(book.author));
    const coverColor = $derived.by(() => pickCoverColor(book));

    function formatTitle(title: string | null | undefined): string {
        const normalized = title?.trim();

        if (!normalized) {
            return 'Untitled';
        }

        const colonIndex = normalized.search(/[:：]/);
        if (colonIndex === -1) {
            return normalized;
        }

        return normalized.slice(0, colonIndex).trim() || normalized;
    }

    function formatAuthor(author: string | null | undefined): string | null {
        const normalized = author?.trim();

        if (!normalized || normalized === 'Unknown Author') {
            return null;
        }

        return normalized;
    }

    function hashString(value: string): number {
        let hash = 0;

        for (let index = 0; index < value.length; index += 1) {
            hash = (hash * 31 + value.charCodeAt(index)) | 0;
        }

        return Math.abs(hash);
    }

    function pickCoverColor(book: Book): string {
        const seed = hashString(`${book.id}:${book.path}:${book.title}`);
        return coverPalette[seed % coverPalette.length];
    }
</script>

<div
    class={cn(
        'book-item group relative overflow-hidden rounded-r-lg transition-shadow hover:cursor-pointer hover:shadow-lg hover:bg-black/30',
        className
    )}
    style:background-color={coverColor}
    role="button"
    tabindex="0"
    aria-label={`打开《${displayTitle}》`}
    title={displayTitle}
    onclick={onOpen}
    onkeydown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onOpen();
        }
    }}
>
    <div class="transition duration-200 group-hover:bg-black/20">
        <div
            class="default-cover flex aspect-[3/4.5] w-full flex-col overflow-hidden rounded-r-lg bg-gradient-to-b from-transparent to-black/20"
        >
            <div class="p-4">
                <h2 class="text-xl font-semibold leading-snug tracking-snug text-white md:text-sm">
                    {displayTitle}
                </h2>
                {#if displayAuthor}
                    <p class="text-xl font-semibold leading-snug tracking-snug text-black md:text-sm">
                        {displayAuthor}
                    </p>
                {/if}
            </div>
        </div>

        {#if onDelete}
            <button
                type="button"
                class="delete-icon absolute bottom-2 right-2 rounded-full bg-white p-2 opacity-0 transition duration-200 hover:bg-white/50 group-hover:opacity-100 group-focus-within:opacity-100"
                aria-label={`删除《${displayTitle}》`}
                title="删除书籍"
                onclick={(event) => {
                    event.stopPropagation();
                    onDelete?.();
                }}
            >
                <Trash2 class="h-4 w-4 text-black" />
            </button>
        {/if}
    </div>
</div>
