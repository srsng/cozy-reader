<script lang="ts" module>
    import { confirm } from '@tauri-apps/plugin-dialog';
    import FileDrop from '$lib/components/common/file-drop.svelte';
    import BookThumbnail from '$lib/components/common/BookThumbnail.svelte';
    import { Button } from '$ui/button';
    import { Plus, BookOpen, FileText, Upload } from 'lucide-svelte';
    import type { Book } from '@cozy-reader/database';
    import { BookFormatNames } from '$lib/database/book/book.js';
    import { toast } from 'svelte-sonner';
    import { slide, fade } from 'svelte/transition';
    import { goHome, goReadBook, goReaderBatchAddPaths } from '$lib/utils/route.svelte.js';
    import { View } from '$lib/components/layout/views/index.js';
    import { USER_SETTINGS } from '$lib/stores/userSettings';
    import { inject } from '$lib/utils/context';
    import { formatDateWithLangCode } from '$lib/utils/date';
    import { BookService } from '@cozy-reader/database';
    import { open } from '@tauri-apps/plugin-dialog';
</script>

<script lang="ts">
    // const { data } = $props();
    let books: Book[] = $state([]);
    const currentSettings = inject(USER_SETTINGS);

    async function loadBooks() {
        const result = await BookService.list();

        if (!result.success) {
            throw new Error(result.error || '加载书籍列表失败');
        }

        books = result.data || [];
    }

    async function refreshBooks() {
        try {
            await loadBooks();
        } catch (error) {
            const message = error instanceof Error ? error.message : '加载书籍列表失败';
            toast.error('加载书籍列表失败', {
                description: message
            });
        }
    }

    const booksPromise = loadBooks();

    async function handleAddBook() {
        const selected = await open({
            multiple: false,
            filters: [
                {
                    name: 'Support Book Files',
                    extensions: BookFormatNames
                }
            ]
        });

        if (!selected) {
            return;
        }

        const result = await BookService.getInstance().addBookByFsPath(selected);

        if (result.success) {
            toast.success('书籍添加成功');
        } else {
            toast.error('添加书籍失败', {
                description: result.error
            });
        }

        await refreshBooks();
    }

    async function handleDeleteBook(book: Book) {
        if (await confirm(`确定要删除书籍 "${book.title}" 吗？`)) {
            const result = await BookService.getInstance().softDelete(book.id);

            if (result.success) {
                toast.success('书籍删除成功');
                await refreshBooks();
            } else {
                toast.error('删除书籍失败', {
                    description: result.error
                });
            }
        }
    }

    function formatDate(dateInput: number | string | null | undefined): string {
        return formatDateWithLangCode(dateInput, $currentSettings.base.langCode);
    }

    function handleDrop(files: string[]) {
        goReaderBatchAddPaths(files);
    }

    function handleInvalidFiles(files: string[]) {
        toast.error('不支持的文件', {
            description: files.join(',\n')
        });
    }
</script>

{#await booksPromise}
    <View.Loading />
{:then}
    <FileDrop
        extensions={BookFormatNames}
        handleFiles={handleDrop}
        {handleInvalidFiles}
        class="h-full w-full"
        overlay
    >
        {#snippet children({ files, isDragOver })}
            <div class="container mx-auto flex h-full min-h-0 flex-col px-6 py-6" transition:slide>
                <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div class="space-y-1">
                        <h1 class="text-2xl font-semibold tracking-tight">我的书架</h1>
                    </div>

                    <Button onclick={handleAddBook} class="shrink-0 gap-2">
                        <Plus class="h-4 w-4" />
                        添加书籍
                    </Button>
                </div>

                <div class="min-h-0 flex-1 overflow-y-auto pb-2 pr-1">
                    {#if books.length === 0}
                        <div
                            class="flex min-h-full flex-col items-center justify-center text-center"
                        >
                            <BookOpen class="text-muted-foreground mb-4 h-16 w-16" />
                            <h2 class="text-xl font-semibold">还没有添加任何书籍</h2>
                            <p class="text-muted-foreground mt-2 max-w-sm text-sm">
                                点击右上角按钮添加书籍，或者直接拖放文件到页面中。
                            </p>
                            <Button onclick={handleAddBook} class="mt-5 gap-2">
                                <Plus class="h-4 w-4" />
                                添加书籍
                            </Button>
                        </div>
                    {:else}
                        <div
                            class="grid grid-cols-2 gap-4 py-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                        >
                            {#each books as book (book.id)}
                                <BookThumbnail
                                    {book}
                                    onOpen={() => goReadBook(book.id)}
                                    onDelete={() => handleDeleteBook(book)}
                                />
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        {/snippet}

        {#snippet overlayBody({
            isDragOver,
            files,
            invalidFiles
        }: {
            isDragOver: boolean;
            files: string[];
            invalidFiles: string[];
        })}
            <div
                class="bg-secondary/80 fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md"
                transition:fade={{ duration: 200 }}
            >
                <div class="text-center">
                    <Upload class="text-primary mx-auto mb-6 h-24 w-24" />
                    <h2 class="text-primary mb-4 text-2xl font-bold">拖放文件到这里添加书籍</h2>
                    {#if files.length > 0}
                        <div class="bg-background/90 max-w-md rounded-lg p-4">
                            <p class="text-muted-foreground mb-2 text-sm font-medium">
                                预计添加书籍 ({files.length}):
                            </p>
                            <div class="max-h-32 space-y-1 overflow-y-auto">
                                {#each files as file}
                                    <div class="flex items-center gap-2 text-sm">
                                        <FileText class="text-primary h-4 w-4 flex-shrink-0" />
                                        <span class="truncate">{file.split(/[\\/]/).pop()}</span>
                                    </div>
                                {/each}
                            </div>

                            {#if invalidFiles.length > 0}
                                <p class="text-muted-foreground mb-2 text-sm font-medium">
                                    不符合支持的文件 ({invalidFiles.length}):
                                </p>
                                <div class="max-h-32 space-y-1 overflow-y-auto">
                                    {#each invalidFiles as file}
                                        <div class="flex items-center gap-2 text-sm">
                                            <FileText class="text-primary h-4 w-4 flex-shrink-0" />
                                            <span class="truncate">{file.split(/[\\/]/).pop()}</span>
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>
        {/snippet}
    </FileDrop>
{:catch error}
    <View.Error
        title="加载书架失败"
        message={error.message}
        footerBtnText="返回主页"
        footerBtnOnclick={goHome}
    />
{/await}
