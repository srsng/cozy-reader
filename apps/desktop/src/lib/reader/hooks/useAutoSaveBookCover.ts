/**
 * useAutoSaveBookCover - 自动保存书籍封面
 * 在书籍加载后自动提取封面图片并保存到数据库
 */

import { bookDataStore } from '../stores/bookDataStore';
import { BookService } from '@cozy-reader/database';
import type { BookDoc } from '../types';
import { extractCoverDataUrl } from '../utils/cover';

/**
 * 自动保存书籍封面
 * @param bookKey 书籍键
 * @param bookDoc 书籍文档对象
 * @returns 清理函数
 */
export function useAutoSaveBookCover(bookKey: string, bookDoc: BookDoc | null): () => void {
    let saved = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

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
    if (bookDoc && !saved) {
        timeoutId = setTimeout(() => {
            saveCover();
        }, 1000); // 1秒延迟，确保书籍已完全加载
    }

    // 返回清理函数
    return () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    };
}
