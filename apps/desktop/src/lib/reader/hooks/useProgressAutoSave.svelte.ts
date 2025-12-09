/**
 * 进度自动保存 Hook
 * 使用节流机制自动保存阅读进度
 * 
 * 这是一个 Svelte 5 的 rune-based hook，使用 .svelte.ts 扩展名以支持 runes
 */

import { untrack } from 'svelte';
import { readerStore } from '../stores/readerStore';
import { bookDataStore } from '../stores/bookDataStore';

/**
 * 节流函数
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
 * 自动保存阅读进度（带节流）
 * 使用 $effect 自动管理订阅和 timeout 的生命周期
 * @param bookKey 书籍键
 */
export function useProgressAutoSave(bookKey: string): () => void {
    // 使用 $state 管理 saveTimeout
    let saveTimeout: ReturnType<typeof setTimeout> | null = $state(null);

    // 使用 $effect 监听 progress 变化并自动保存（参考 readest 实现）
    $effect(() => {
        // 获取当前进度（响应式）
        const progress = readerStore.getProgress(bookKey);

        // 如果进度不存在，不执行保存
        if (!progress) return;

        // 参考 readest：throttle(10s) + setTimeout(5s) 双重防抖
        const saveBookConfig = throttle(() => {
            if (saveTimeout) {
                clearTimeout(saveTimeout);
            }
            saveTimeout = setTimeout(async () => {
                // 使用 untrack 避免响应式更新触发不必要的保存
                const config = untrack(() => bookDataStore.getConfig(bookKey));
                if (!config) return;

                const bookData = untrack(() => bookDataStore.getBookData(bookKey));
                if (!bookData?.book?.id) return;

                const bookIdStr = String(bookData.book.id);
                await bookDataStore.saveConfig(bookIdStr, config);
            }, 5000);
        }, 10000);

        // 触发保存
        saveBookConfig();

        // 自动清理 timeout
        return () => {
            if (saveTimeout) {
                clearTimeout(saveTimeout);
                saveTimeout = null;
            }
        };
    });

    // 为了保持 API 兼容性，仍然返回一个清理函数（虽然 $effect 会自动清理）
    return () => { };
}

