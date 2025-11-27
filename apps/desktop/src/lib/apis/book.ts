import { toast } from 'svelte-sonner';
import { open } from '@tauri-apps/plugin-dialog';
import type { Book } from '$lib/database/book/book';
import { BookFormat, BookFormatNames, StorageType } from '$lib/database/book/book';
import { BookService } from '$lib/database/book/bookService';

/**
 * 书籍相关的业务逻辑工具函数
 */

/**
 * 加载书籍列表
 * @returns 书籍列表
 */
export async function loadBooks(): Promise<Book[]> {
    const result = await BookService.getAllBooks();
    if (result.success) {
        return result.data || [];
    } else {
        toast.error('加载书籍失败', {
            description: result.error
        });
        return [];
    }
}

/**
 * 加载书籍列表（带错误处理）
 * @returns 书籍列表
 */
export async function loadBooksSafe(): Promise<Book[]> {
    // loadBooks 内部已经处理了所有错误（数据库错误和 toast 显示），不会抛出异常
    return await loadBooks();
}

/**
 * 添加书籍
 * @param onSuccess 成功回调
 * @param onError 错误回调
 */
export async function addBook(
    onSuccess?: () => void | Promise<void>,
    onError?: (error: string) => void | Promise<void>
): Promise<void> {
    try {
        // try-catch 用于捕获 open 对话框的错误（必要）
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
            // BookService.createBook 使用 safeExecute，不会抛出异常，只返回 DatabaseResult
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
                await onSuccess?.();
            } else {
                toast.error('添加书籍失败: ' + result.error);
                await onError?.(result.error);
            }
        }
    } catch (error) {
        // 捕获对话框错误或其他非数据库错误
        console.error('添加书籍失败:', error);
        toast.error('添加书籍失败');
        await onError?.(error instanceof Error ? error.message : 'Unknown error');
    }
}

/**
 * 删除书籍
 * @param book 要删除的书籍
 * @param onSuccess 成功回调
 * @param onError 错误回调
 */
export async function deleteBook(
    book: Book,
    onSuccess?: () => void | Promise<void>,
    onError?: (error: string) => void | Promise<void>
): Promise<void> {
    // BookService.deleteBook 使用 safeExecute，不会抛出异常，只返回 DatabaseResult
    // 没有其他可能抛出异常的操作，直接处理 DatabaseResult 即可
    const result = await BookService.deleteBook(book.id);
    if (result.success) {
        toast.success('书籍删除成功');
        await onSuccess?.();
    } else {
        toast.error('删除书籍失败: ' + result.error);
        await onError?.(result.error);
    }
}

