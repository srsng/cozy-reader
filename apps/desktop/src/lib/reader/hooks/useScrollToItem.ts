/**
 * useScrollToItem hook
 * 用于检测当前搜索结果并自动滚动到可见区域
 * 
 * 这是一个纯函数式 hook，不依赖 Svelte runes
 */

import type { BookProgress } from '../types';
import * as CFI from 'foliate-js/epubcfi.js';

/**
 * 检测当前搜索结果并自动滚动
 * @param cfi 搜索结果的 CFI
 * @param progress 当前阅读进度
 * @returns isCurrent 和 viewRef
 */
export function useScrollToItem(
    cfi: string,
    progress: BookProgress | null
): { isCurrent: boolean; viewRef: (node: HTMLElement | null) => void } {
    // 纯函数计算 isCurrent
    const isCurrent = (() => {
        if (!progress) return false;

        const { location } = progress;
        const start = CFI.collapse(location);
        const end = CFI.collapse(location, true);
        return CFI.compare(cfi, start) >= 0 && CFI.compare(cfi, end) <= 0;
    })();

    // viewRef 回调函数，用于设置元素引用
    // 注意：滚动逻辑应该在调用组件中使用 $effect 处理
    const viewRef = (node: HTMLElement | null) => {
        // 这个函数主要用于设置引用，实际的滚动逻辑在组件中处理
        // 如果需要存储引用，可以在组件层面处理
    };

    return { isCurrent, viewRef };
}

