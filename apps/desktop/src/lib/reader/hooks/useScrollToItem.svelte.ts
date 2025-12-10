/**
 * useScrollToItem hook
 * 用于检测当前搜索结果并自动滚动到可见区域
 * 
 * 这是一个 Svelte 5 的 rune-based hook，使用 .svelte.ts 扩展名以支持 runes 和 TypeScript
 */

import type { BookProgress } from '../types';
import * as CFI from 'foliate-js/epubcfi.js';

/**
 * 检测当前搜索结果并自动滚动
 * @param cfi 搜索结果的 CFI
 * @param progress 当前阅读进度（响应式）
 * @returns isCurrent 和 viewRef
 */
export function useScrollToItem(
    cfi: string,
    progress: BookProgress | null
): { isCurrent: boolean; viewRef: (node: HTMLElement | null) => void } {
    let viewRefElement: HTMLElement | null = $state(null);

    const isCurrent = $derived.by(() => {
        if (!progress) return false;

        const { location } = progress;
        const start = CFI.collapse(location);
        const end = CFI.collapse(location, true);
        return CFI.compare(cfi, start) >= 0 && CFI.compare(cfi, end) <= 0;
    });

    $effect(() => {
        if (!viewRefElement || !isCurrent) return;

        // 如果当前结果不可见，滚动到可见区域
        const element = viewRefElement;
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

        if (!isVisible) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        element.setAttribute('aria-current', 'page');
    });

    const viewRef = (node: HTMLElement | null) => {
        viewRefElement = node;
    };

    return { isCurrent, viewRef };
}

