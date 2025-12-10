/**
 * 进度自动保存 Hook
 * 使用防抖机制自动保存阅读进度
 */

import { readerStore } from '../stores/readerStore';
import { bookDataStore } from '../stores/bookDataStore';

/**
 * 防抖函数
 */
function throttle<T extends (...args: any[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let lastCallTime = 0;

    return function executedFunction(...args: Parameters<T>) {
        const now = Date.now();
        const timeSinceLastCall = now - lastCallTime;

        if (timeSinceLastCall >= wait) {
            lastCallTime = now;
            func(...args);
        } else {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                lastCallTime = Date.now();
                func(...args);
            }, wait - timeSinceLastCall);
        }
    };
}

/**
 * useProgressAutoSave Hook
 * 自动保存阅读进度（带防抖）
 * 返回清理函数，需要在组件的 onMount 中调用，onDestroy 中调用返回的清理函数
 */
export function useProgressAutoSave(bookKey: string): () => void {
    let saveTimeout: ReturnType<typeof setTimeout> | null = null;

    const saveBookConfig = throttle(() => {
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        saveTimeout = setTimeout(async () => {
            const config = bookDataStore.getConfig(bookKey);
            if (!config) return;

            const bookData = bookDataStore.getBookData(bookKey);
            if (!bookData?.book?.id) return;

            const bookIdStr = String(bookData.book.id);
            await bookDataStore.saveConfig(bookIdStr, config);
        }, 5000);
    }, 10000);

    // 订阅 readerStore 的变化
    const unsubscribe = readerStore.subscribe(() => {
        const progress = readerStore.getProgress(bookKey);
        if (progress) {
            saveBookConfig();
        }
    });

    // 返回清理函数
    return () => {
        unsubscribe();
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
    };
}
