/**
 * useAutoSaveBookCover - 自动保存书籍封面
 * 在书籍加载后自动提取封面图片并保存到数据库
 *
 * 这是一个 Svelte 5 的 rune-based hook，使用 .svelte.ts 扩展名以支持 runes
 */

import { bookDataStore } from '../stores/bookDataStore';
import { BookService } from '@cozy-reader/database';
import type { BookDoc } from '../types';
import { extractCoverDataUrl } from '../utils/cover';

/**
 * 自动保存书籍封面
 * 使用 $effect 自动管理延迟保存逻辑和清理
 * @param bookKey 书籍键
 * @param bookDoc 书籍文档对象
 */
export function useAutoSaveBookCover(bookKey: string, bookDoc: BookDoc | null): () => void {
    // 使用 $state 管理 saved 状态
    let saved = $state(false);

    // 使用 $effect 管理延迟保存逻辑
    $effect(() => {
        if (saved || !bookDoc) return;

        const saveCover = async () => {
            if (saved || !bookDoc) return;

            const bookData = bookDataStore.getBookData(bookKey);
            if (!bookData?.book?.id) {
                return;
            }

            // 如果已经有封面，跳过
            if (bookData.book.cover) {
                saved = true;
                return;
            }

            try {
                const dataUrl = await extractCoverDataUrl(bookDoc);
                if (!dataUrl) return;

                // 保存到数据库
                const result = await BookService.update(bookData.book.id, {
                    cover: dataUrl
                });

                if (result.success) {
                    saved = true;
                    // 更新 bookDataStore 中的书籍对象
                    bookDataStore.setBookData(bookKey, {
                        book: result.data || bookData.book
                    });
                }
            } catch (error) {
                console.error('Failed to auto-save book cover:', error);
            }
        };

        // 延迟保存，等待书籍完全加载
        const timeoutId = setTimeout(() => {
            saveCover();
        }, 1000); // 1秒延迟，确保书籍已完全加载

        // 自动清理 timeout
        return () => {
            clearTimeout(timeoutId);
        };
    });

    // 为了保持 API 兼容性，仍然返回一个清理函数（虽然 $effect 会自动清理）
    return () => {};
}
