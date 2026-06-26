<script lang="ts" module>
    import type { Book } from '@cozy-reader/database';
    import { Trash2 } from 'lucide-svelte';
    import { cn } from '$lib/utils.js';
    import { Button } from '$components/ui/button';

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

    const coverBaseClass = 'aspect-[3/4.5] w-full select-none overflow-hidden rounded-r-lg';

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

    // todo: 考虑优化
    function pickCoverColor(book: Book): string {
        const seed = hashString(`${book.id}:${book.path}:${book.title}`);
        return coverPalette[seed % coverPalette.length];
    }
</script>

<script lang="ts">
    let { book, onOpen, onDelete, class: className = '' }: Props = $props();

    let coverLoadFailed = $state(false);

    const displayTitle = $derived.by(() => formatTitle(book.title));
    const displayAuthor = $derived.by(() => formatAuthor(book.author));
    const coverColor = $derived.by(() => pickCoverColor(book));
    const coverSrc = $derived.by(() => book.cover?.trim() || null);

    $effect(() => {
        if (coverSrc) {
            coverLoadFailed = false;
        }
    });
</script>

{#snippet oriCover()}
    <div class={cn(coverBaseClass)}>
        <img
            src={coverSrc}
            alt={displayTitle}
            class="h-full w-full object-cover"
            loading="lazy"
            draggable="false"
            onerror={() => {
                coverLoadFailed = true;
            }}
        />
    </div>
{/snippet}

{#snippet customCover()}
    <div class={cn(coverBaseClass, 'flex flex-col bg-gradient-to-b from-transparent to-black/20')}>
        <div class="p-4">
            <h2 class="tracking-snug text-xl font-semibold leading-snug text-white md:text-sm">
                {displayTitle}
            </h2>
            {#if displayAuthor}
                <p class="tracking-snug text-xl font-semibold leading-snug text-black md:text-sm">
                    {displayAuthor}
                </p>
            {/if}
        </div>
    </div>
{/snippet}

<div
    class={cn(
        'book-item group relative overflow-hidden rounded-r-lg transition-shadow hover:cursor-pointer hover:bg-black/30 hover:shadow-lg',
        className
    )}
    style:background-color={coverColor}
    role="button"
    tabindex="0"
    aria-label={`书籍《${displayTitle}》`}
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
        {#if coverSrc && !coverLoadFailed}
            {@render oriCover()}
        {:else}
            {@render customCover()}
        {/if}

        {#if onDelete}
            <button
                type="button"
                class="delete-icon absolute bottom-2 right-2 rounded-full bg-white p-2 opacity-0 transition duration-200 hover:bg-white/50 group-focus-within:opacity-100 group-hover:opacity-100"
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
