/**
 * useBooksManager - 书籍管理 Hook
 * 提供统一的书籍打开、关闭、切换功能
 *
 * 这是一个 Svelte 5 的 rune-based hook，使用 .svelte.ts 扩展名以支持 runes
 */

import { readerStore } from '../stores/readerStore';
import { bookDataStore } from '../stores/bookDataStore';
import { sidebarStore } from '../stores/sidebarStore';
import { notebookStore } from '../stores/notebookStore';
import type { Book } from '@cozy-reader/database';
import { uniqueId } from '../utils/misc';

/**
 * 书籍管理选项
 */
export interface BooksManagerOptions {
    /** 是否在关闭书籍时保存进度 */
    saveProgressOnClose?: boolean;
    /** 是否在关闭书籍时清理数据 */
    cleanupOnClose?: boolean;
}

/**
 * 书籍管理 Hook
 * 保持函数式 API，内部可以使用 runes 增强响应式能力
 * @param options 管理选项
 * @returns 书籍管理方法
 */
export function useBooksManager(options: BooksManagerOptions = {}) {
    const { saveProgressOnClose = true, cleanupOnClose = true } = options;

    /**
     * 打开书籍
     * @param book 书籍对象
     * @returns 生成的 bookKey
     */
    const openBook = (book: Book): string => {
        const bookKey = `${book.id}-${uniqueId()}`;
        const currentBookKeys = readerStore.getBookKeys();

        if (!currentBookKeys.includes(bookKey)) {
            readerStore.setBookKeys([...currentBookKeys, bookKey]);
        }

        return bookKey;
    };

    /**
     * 关闭书籍
     * @param bookKey 书籍键
     */
    const closeBook = async (bookKey: string): Promise<void> => {
        // 保存进度
        if (saveProgressOnClose) {
            const viewState = readerStore.getViewState(bookKey);
            if (viewState?.progress) {
                // 进度会自动保存（通过 useProgressAutoSave）
            }
        }

        // 关闭视图
        const view = readerStore.getView(bookKey);
        if (view) {
            try {
                view.close();
            } catch (error) {
                console.error('Error closing view:', error);
            }
        }

        // 清理数据
        if (cleanupOnClose) {
            // 从 bookKeys 列表中移除
            const currentBookKeys = readerStore.getBookKeys();
            readerStore.setBookKeys(currentBookKeys.filter((key) => key !== bookKey));

            // 清理视图状态
            readerStore.clearViewState(bookKey);

            // 清理侧边栏状态（如果当前书籍是侧边栏关联的书籍）
            const sideBarBookKey = sidebarStore.getSideBarBookKey();
            if (sideBarBookKey === bookKey) {
                sidebarStore.setSideBarBookKey(null);
                sidebarStore.setVisible(false);
            }

            // 清理笔记本状态
            notebookStore.setVisible(false);
            notebookStore.setNewAnnotation(null);
            notebookStore.setEditAnnotation(null);
        }
    };

    /**
     * 切换书籍（关闭当前，打开新的）
     * @param currentBookKey 当前书籍键
     * @param newBook 新书籍对象
     * @returns 新书籍的 bookKey
     */
    const switchBook = async (currentBookKey: string, newBook: Book): Promise<string> => {
        await closeBook(currentBookKey);
        return openBook(newBook);
    };

    /**
     * 关闭所有书籍
     */
    const closeAllBooks = async (): Promise<void> => {
        const bookKeys = readerStore.getBookKeys();
        await Promise.all(bookKeys.map((key) => closeBook(key)));
    };

    /**
     * 获取当前打开的书籍数量
     */
    const getOpenBooksCount = (): number => {
        return readerStore.getBookKeys().length;
    };

    /**
     * 检查书籍是否已打开
     * @param bookId 书籍 ID
     * @returns 是否已打开
     */
    const isBookOpen = (bookId: number): boolean => {
        const bookKeys = readerStore.getBookKeys();
        return bookKeys.some((key) => key.startsWith(`${bookId}-`));
    };

    /**
     * 获取书籍的所有打开视图的 bookKey
     * @param bookId 书籍 ID
     * @returns bookKey 数组
     */
    const getBookViewKeys = (bookId: number): string[] => {
        const bookKeys = readerStore.getBookKeys();
        return bookKeys.filter((key) => key.startsWith(`${bookId}-`));
    };

    return {
        openBook,
        closeBook,
        switchBook,
        closeAllBooks,
        getOpenBooksCount,
        isBookOpen,
        getBookViewKeys
    };
}
