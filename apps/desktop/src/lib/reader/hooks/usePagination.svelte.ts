/**
 * 分页处理 Hook
 * 用于处理页面翻转、滚动等分页操作
 * 
 * 这是一个 Svelte 5 的 rune-based hook，使用 .svelte.ts 扩展名以支持 runes
 */

import { readerStore } from '../stores/readerStore';
import { bookDataStore } from '../stores/bookDataStore';
import type { FoliateViewElement } from '../types';
import type { ReaderSettings } from '../settings';
import type { ScrollSource } from './useIframeEvents.svelte';

/**
 * 分页方向
 */
export type PaginationSide = 'left' | 'right' | 'up' | 'down';

/**
 * 分页模式
 */
export type PaginationMode = 'page' | 'section';

/**
 * 交换左右方向（用于 RTL）
 */
const swapLeftRight = (side: PaginationSide): PaginationSide => {
    if (side === 'left') return 'right';
    if (side === 'right') return 'left';
    return side;
};

/**
 * 视图分页函数
 * @param view foliate-view 实例
 * @param readerSettings 阅读器设置
 * @param side 分页方向
 * @param mode 分页模式
 */
export const viewPagination = (
    view: FoliateViewElement | null,
    readerSettings: ReaderSettings | null | undefined,
    side: PaginationSide,
    mode: PaginationMode = 'page'
): void => {
    if (!view || !readerSettings) return;
    const renderer = view.renderer;

    // 处理 RTL 方向
    if (view.book.dir === 'rtl') {
        side = swapLeftRight(side);
    }

    if (renderer.scrolled) {
        const size = renderer.size ?? 0;
        const showHeader = readerSettings.showHeader && readerSettings.showBarsOnScroll;
        const showFooter = readerSettings.showFooter && readerSettings.showBarsOnScroll;
        const scrollingOverlap = readerSettings.scrollingOverlap ?? 0;
        const distance = size - scrollingOverlap - (showHeader ? 44 : 0) - (showFooter ? 44 : 0);

        switch (mode) {
            case 'page':
                if (side === 'left' || side === 'up') {
                    view.prev(distance);
                } else {
                    view.next(distance);
                }
                break;
            case 'section':
                if (side === 'left' || side === 'up') {
                    renderer.prevSection?.().catch(() => { });
                } else {
                    renderer.nextSection?.().catch(() => { });
                }
                break;
        }
    } else {
        switch (mode) {
            case 'page':
                if (side === 'left' || side === 'up') {
                    view.prev();
                } else {
                    view.next();
                }
                break;
            case 'section':
                if (side === 'left' || side === 'up') {
                    renderer.prevSection?.().catch(() => { });
                } else {
                    renderer.nextSection?.().catch(() => { });
                }
                break;
        }
    }
};

/**
 * usePagination Hook
 * 处理分页相关的事件
 * @param bookKey 书籍键
 * @param viewRef 视图引用对象
 * @param containerRef 容器引用对象
 */
export function usePagination(
    bookKey: string,
    viewRef: { current: FoliateViewElement | null },
    containerRef: { current: HTMLDivElement | null }
): {
    handlePageFlip: (
        msg: MessageEvent | CustomEvent | MouseEvent
    ) => void | Promise<void>;
    handleContinuousScroll: (mode: ScrollSource, scrollDelta: number, threshold: number) => void;
} {
    const handlePageFlip = async (
        msg: MessageEvent | CustomEvent | MouseEvent
    ): Promise<void> => {
        const viewState = readerStore.getViewState(bookKey);
        const bookData = bookDataStore.getBookData(bookKey);
        if (!viewState?.inited || !bookData) return;

        if (msg instanceof MessageEvent) {
            if (msg.data && msg.data.bookKey === bookKey) {
                const readerSettings = readerStore.getReaderSettings(bookKey);
                if (!readerSettings) return;

                if (msg.data.type === 'iframe-single-click') {
                    const viewElement = containerRef.current;
                    if (viewElement) {
                        const { screenX } = msg.data;
                        const viewRect = viewElement.getBoundingClientRect();
                        // TODO: 处理窗口位置（Tauri 平台）
                        const windowStartX = window.screenX;
                        const viewStartX = windowStartX + viewRect.left;
                        const viewCenterX = viewStartX + viewRect.width / 2;

                        // TODO: 处理事件分发器（iframe-single-click）
                        // const consumed = eventDispatcher.dispatchSync('iframe-single-click');
                        // if (!consumed) {
                        const centerStartX = viewStartX + viewRect.width * 0.375;
                        const centerEndX = viewStartX + viewRect.width * 0.625;
                        const currentHoveredBookKey = readerStore.getHoveredBookKey();

                        if (
                            readerSettings.disableClick ||
                            (screenX >= centerStartX && screenX <= centerEndX)
                        ) {
                            // 切换 header/footer 显示
                            readerStore.setHoveredBookKey(currentHoveredBookKey ? null : bookKey);
                        } else {
                            if (currentHoveredBookKey) {
                                readerStore.setHoveredBookKey(null);
                                return;
                            }
                            if (!readerSettings.disableClick) {
                                if (screenX >= viewCenterX) {
                                    if (readerSettings.fullscreenClickArea) {
                                        viewPagination(viewRef.current, readerSettings, 'down');
                                    } else if (readerSettings.swapClickArea) {
                                        viewPagination(viewRef.current, readerSettings, 'left');
                                    } else {
                                        viewPagination(viewRef.current, readerSettings, 'right');
                                    }
                                } else {
                                    if (readerSettings.fullscreenClickArea) {
                                        viewPagination(viewRef.current, readerSettings, 'down');
                                    } else if (readerSettings.swapClickArea) {
                                        viewPagination(viewRef.current, readerSettings, 'right');
                                    } else {
                                        viewPagination(viewRef.current, readerSettings, 'left');
                                    }
                                }
                            }
                        }
                        // }
                    }
                } else if (
                    msg.data.type === 'iframe-wheel' &&
                    !readerSettings.scrolled &&
                    (!bookData.isFixedLayout || (readerSettings.zoomLevel ?? 100) <= 100)
                ) {
                    const { deltaY } = msg.data;
                    if (deltaY > 0) {
                        viewRef.current?.next(1);
                    } else if (deltaY < 0) {
                        viewRef.current?.prev(1);
                    }
                } else if (msg.data.type === 'iframe-mouseup') {
                    if (msg.data.button === 3 && viewRef.current?.history) {
                        viewRef.current.history.back();
                    } else if (msg.data.button === 4 && viewRef.current?.history) {
                        viewRef.current.history.forward();
                    }
                }
            }
        } else if (msg instanceof CustomEvent) {
            const readerSettings = readerStore.getReaderSettings(bookKey);
            if (!readerSettings) return;

            if (msg.type === 'native-key-down' && readerSettings.volumeKeysToFlip) {
                const { keyName } = msg.detail;
                readerStore.setHoveredBookKey('');
                if (keyName === 'VolumeUp') {
                    viewPagination(viewRef.current, readerSettings, 'up');
                } else if (keyName === 'VolumeDown') {
                    viewPagination(viewRef.current, readerSettings, 'down');
                }
            } else if (
                msg.type === 'touch-swipe' &&
                bookData.isFixedLayout &&
                readerSettings &&
                (readerSettings.zoomLevel ?? 100) <= 100
            ) {
                const { deltaX, deltaY, deltaT } = msg.detail;
                const vx = Math.abs(deltaX / deltaT);
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30 && vx > 0.2) {
                    if (deltaX > 0) {
                        viewPagination(viewRef.current, readerSettings, 'left');
                    } else {
                        viewPagination(viewRef.current, readerSettings, 'right');
                    }
                }
            }
        } else {
            if (msg.type === 'click') {
                const { clientX } = msg;
                const width = window.innerWidth;
                const leftThreshold = width * 0.5;
                const rightThreshold = width * 0.5;
                const readerSettings = readerStore.getReaderSettings(bookKey);
                if (clientX < leftThreshold) {
                    viewPagination(viewRef.current, readerSettings, 'left');
                } else if (clientX > rightThreshold) {
                    viewPagination(viewRef.current, readerSettings, 'right');
                }
            }
        }
    };

    const handleContinuousScroll = (
        mode: ScrollSource,
        scrollDelta: number,
        threshold: number
    ): void => {
        const renderer = viewRef.current?.renderer;
        const readerSettings = readerStore.getReaderSettings(bookKey);
        const bookData = bookDataStore.getBookData(bookKey);

        if (!renderer || !readerSettings || !bookData) return;

        // 固定布局不支持连续滚动
        if (bookData.bookDoc?.rendition?.layout === 'pre-paginated') return;

        if (readerSettings.scrolled && readerSettings.continuousScroll) {
            const start = renderer.start ?? 0;
            const end = renderer.end ?? 0;
            const viewSize = renderer.viewSize ?? 0;
            const size = renderer.size ?? 0;

            const doScroll = () => {
                // 向上滚动：可能触发上一页
                if (start <= scrollDelta && scrollDelta > threshold) {
                    setTimeout(() => {
                        viewRef.current?.prev(start + 1);
                    }, 100);
                }
                // 向下滚动：可能触发下一页
                else if (
                    Math.ceil(end) - scrollDelta >= viewSize &&
                    scrollDelta < -threshold
                ) {
                    setTimeout(() => {
                        viewRef.current?.next(
                            viewSize - Math.floor(end) + 1
                        );
                    }, 100);
                }
            };

            if (mode === 'mouse') {
                // 鼠标滚轮事件总是可用
                doScroll();
            } else if (mode === 'touch') {
                // 当文档高度小于视口高度时，无法获取 relocate 事件
                if (size >= viewSize) {
                    doScroll();
                } else {
                    // 在 relocate 事件后滚动
                    if (renderer.addEventListener) {
                        renderer.addEventListener('relocate', () => doScroll(), { once: true });
                    }
                }
            }
        }
    };

    return {
        handlePageFlip,
        handleContinuousScroll,
    };
}

