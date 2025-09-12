<script lang="ts" module>
	import FileDrop from '$lib/components/common/file-drop.svelte';
	import { confirm } from '@tauri-apps/plugin-dialog';
	import { Button } from '@cozy/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '@cozy/ui/card';
	import { Trash2, Plus, BookOpen, FileText, Upload } from 'lucide-svelte';
	import type { Book } from '$lib/database/book/book.js';
	import { BookFormat, BookFormatNames, StorageType } from '$lib/database/book/book.js';
	import { open } from '@tauri-apps/plugin-dialog';
	import { toast } from 'svelte-sonner';
	import { slide, fade } from 'svelte/transition';
	import { goHome, goReadBook, goReaderBatchAddPaths } from '$lib/utils/route.svelte.js';
	import { View } from '$lib/components/layout/views/index.js';
</script>

<script lang="ts">
	const { data } = $props();
	let books: Book[] = $state([]);
	const BookService = data.bookService;

	async function loadBooksUnsafe() {
		const result = await BookService.getAllBooks();
		if (result.success) {
			books = result.data || [];
		} else {
			toast.error('加载书籍失败', {
				description: result.error
			});
		}
	}

	// 加载书籍列表
	async function loadBooks() {
		try {
			await loadBooksUnsafe();
		} catch (error) {
			console.error('加载书籍失败:', error);
			toast.error('加载书籍失败', {
				description: `${error}`
			});
		}
	}

	// 添加书籍
	async function addBook() {
		try {
			const selected = await open({
				multiple: false,
				filters: [
					{
						name: 'Support Book Files',
						extensions: BookFormatNames
					}
				]
			});

			if (selected) {
				const fileName = selected.split(/[\\/]/).pop() || 'Unknown';
				const result = await BookService.createBook({
					path: selected,
					title: fileName.replace(/\.(md|markdown)$/i, ''),
					format: BookFormat.MARKDOWN,
					storage_type: StorageType.FILESYSTEM,
					file_size: 0,
					tags: []
				});

				if (result.success) {
					toast.success('书籍添加成功');
					await loadBooks();
				} else {
					toast.error('添加书籍失败: ' + result.error);
				}
			}
		} catch (error) {
			console.error('添加书籍失败:', error);
			toast.error('添加书籍失败');
		}
	}

	// 删除书籍
	async function deleteBook(book: Book) {
		if (await confirm(`确定要删除书籍 "${book.title}" 吗？`)) {
			try {
				const result = await BookService.deleteBook(book.id);
				if (result.success) {
					toast.success('书籍删除成功');
					await loadBooks();
				} else {
					toast.error('删除书籍失败: ' + result.error);
				}
			} catch (error) {
				console.error('删除书籍失败:', error);
				toast.error('删除书籍失败');
			}
		}
	}

	// 格式化日期
	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('zh-CN');
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

{#await loadBooksUnsafe()}
	<View.Loading />
{:then _res}
	<FileDrop
		extensions={BookFormatNames}
		handleFiles={handleDrop}
		{handleInvalidFiles}
		class="h-full w-full"
		overlay
	>
		{#snippet children({ files, isDragOver })}
			<div class="container mx-auto p-6" transition:slide>
				<div class="mb-6 flex items-center justify-between">
					<h1 class="text-3xl font-bold">我的书库 files:</h1>
					<Button onclick={addBook} class="flex items-center gap-2">
						<Plus class="h-4 w-4" />
						添加书籍
					</Button>
				</div>

				{#if books.length === 0}
					<div class="flex h-64 flex-col items-center justify-center text-center">
						<BookOpen class="text-muted-foreground mb-4 h-16 w-16" />
						<h2 class="mb-2 text-xl font-semibold">还没有添加任何书籍</h2>
						<p class="text-muted-foreground mb-4">点击上方的"添加书籍"按钮开始添加您的第一本书</p>
						<Button onclick={addBook} class="flex items-center gap-2">
							<Plus class="h-4 w-4" />
							添加书籍
						</Button>
					</div>
				{:else}
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{#each books as book (book.id)}
							<!-- todo animate:flip -->
							<Card class="cursor-pointer transition-shadow hover:shadow-lg">
								<CardHeader class="pb-3">
									<div class="flex items-start justify-between">
										<CardTitle class="line-clamp-2 text-lg">{book.title}</CardTitle>
										<Button
											variant="ghost"
											size="sm"
											onclick={(e) => {
												e.stopPropagation();
												deleteBook(book);
											}}
											class="text-destructive hover:text-destructive"
										>
											<Trash2 class="h-4 w-4" />
										</Button>
									</div>
									{#if book.author}
										<p class="text-muted-foreground text-sm">作者: {book.author}</p>
									{/if}
								</CardHeader>
								<CardContent>
									<div class="space-y-3">
										<Button onclick={() => goReadBook(book.id)}>Read</Button>
										<!-- 阅读进度 -->
										<!-- <div class="flex items-center gap-2">
								<Clock class="text-muted-foreground h-4 w-4" />
								<span class="text-muted-foreground text-sm">
								progress: {formatProgress(book.current_progress)}%
							</span>
							</div> -->

										<!-- 状态 -->
										<!-- <div class="flex items-center gap-2">
								<Badge
									variant={book.status === 'reading'
										? 'default'
										: book.status === 'completed'
											? 'secondary'
											: 'outline'}
								>
									{book.status === 'reading'
										? '阅读中'
										: book.status === 'completed'
											? '已完成'
											: '未开始'}
								</Badge>
							</div> -->

										<!-- 标签 -->
										<!-- {#if book.tags && book.tags.length > 0}
								<div class="flex flex-wrap gap-1">
									{#each book.tags as tag}
										<Badge variant="outline" class="text-xs">{tag}</Badge>
									{/each}
								</div>
							{/if} -->

										<!-- 添加时间 -->
										<div class="text-muted-foreground flex items-center gap-2 text-xs">
											<FileText class="h-3 w-3" />
											<span>添加于 {formatDate(book.added_at)}</span>
										</div>
									</div>
								</CardContent>
							</Card>
						{/each}
					</div>
				{/if}
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
		title="加载书库失败"
		message={error.message}
		footerBtnText="返回主页"
		footerBtnOnclick={goHome}
	/>
{/await}
