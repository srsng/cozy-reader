/**
 * 进度同步 Hook
 * 用于同步阅读进度到数据库和云端
 */

import { readerStore } from '../stores/readerStore';
import { bookDataStore } from '../stores/bookDataStore';

/**
 * useProgressSync Hook
 * 监听进度变化并同步
 * 返回清理函数，需要在组件的 onMount 中调用，onDestroy 中调用返回的清理函数
 */
export function useProgressSync(bookKey: string): () => void {
    const syncProgress = () => {
        const progress = readerStore.getProgress(bookKey);
        if (!progress) return;

        const bookData = bookDataStore.getBookData(bookKey);
        if (!bookData?.book?.id) return;

        const viewState = readerStore.getViewState(bookKey);

        // 如果是主视图，同步进度
        if (viewState?.isPrimary) {
            // 进度同步逻辑已经在 readerStore.setProgress 中处理
            // 这里可以添加额外的同步逻辑（如云端同步）
        }
    };

    // 订阅 readerStore 的变化
    const unsubscribe = readerStore.subscribe(() => {
        syncProgress();
    });

    // 返回清理函数
    return () => {
        unsubscribe();
    };
}
