/**
 * Foliate 事件处理 Hook
 * 用于处理 foliate-view 元素的各种事件
 */

import type { FoliateViewElement } from '../types';

/**
 * Foliate 事件处理器接口
 */
export interface FoliateEventHandler {
    onLoad?: (event: Event) => void;
    onRelocate?: (event: Event) => void;
    onLinkClick?: (event: Event) => void;
    onRendererRelocate?: (event: Event) => void;
    onDrawAnnotation?: (event: Event) => void;
    onShowAnnotation?: (event: Event) => void;
}

/**
 * 设置 foliate-view 事件监听器
 * @param view foliate-view 元素实例
 * @param handlers 事件处理器对象
 * @returns 清理函数
 */
export function useFoliateEvents(
    view: FoliateViewElement | null,
    handlers?: FoliateEventHandler
): () => void {
    if (!view || !handlers) {
        return () => { };
    }

    const { onLoad, onRelocate, onLinkClick, onRendererRelocate, onDrawAnnotation, onShowAnnotation } =
        handlers;

    // 添加事件监听器
    if (onLoad) view.addEventListener('load', onLoad);
    if (onRelocate) view.addEventListener('relocate', onRelocate);
    if (onLinkClick) view.addEventListener('link', onLinkClick);
    if (onRendererRelocate && view.renderer.addEventListener) {
        view.renderer.addEventListener('relocate', onRendererRelocate);
    }
    if (onDrawAnnotation) view.addEventListener('draw-annotation', onDrawAnnotation);
    if (onShowAnnotation) view.addEventListener('show-annotation', onShowAnnotation);

    // 返回清理函数
    return () => {
        if (onLoad) view.removeEventListener('load', onLoad);
        if (onRelocate) view.removeEventListener('relocate', onRelocate);
        if (onLinkClick) view.removeEventListener('link', onLinkClick);
        if (onRendererRelocate && view.renderer.removeEventListener) {
            view.renderer.removeEventListener('relocate', onRendererRelocate);
        }
        if (onDrawAnnotation) view.removeEventListener('draw-annotation', onDrawAnnotation);
        if (onShowAnnotation) view.removeEventListener('show-annotation', onShowAnnotation);
    };
}

/**
 * Svelte 5 版本的 useFoliateEvents
 * 在组件中使用 $effect 调用
 */
export function setupFoliateEvents(
    view: FoliateViewElement | null,
    handlers?: FoliateEventHandler
): () => void {
    return useFoliateEvents(view, handlers);
}
