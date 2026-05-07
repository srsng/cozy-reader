/**
 * iframe 事件处理 Hook
 * 用于处理来自 iframe 的消息事件（鼠标、触摸、滚轮等）
 *
 * 这是一个 Svelte 5 的 rune-based hook，使用 .svelte.ts 扩展名以支持 runes
 */

import { readerStore } from '../stores/readerStore';
import { bookDataStore } from '../stores/bookDataStore';

/**
 * 滚动源类型
 */
export type ScrollSource = 'touch' | 'mouse';

/**
 * 防抖函数
 */
function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

/**
 * useMouseEvent Hook
 * 处理鼠标和滚轮事件
 * 使用 $effect 自动管理事件监听器的生命周期
 * @param bookKey 书籍键
 * @param handlePageFlip 页面翻转处理函数
 * @param handleContinuousScroll 连续滚动处理函数
 */
export function useMouseEvent(
    bookKey: string,
    handlePageFlip: (msg: MessageEvent | MouseEvent) => void,
    handleContinuousScroll: (source: ScrollSource, delta: number, threshold: number) => void
): {
    onClick: (msg: MouseEvent) => void;
    onWheel: (event: WheelEvent) => void;
    setup: () => () => void;
} {
    const debounceScroll = debounce(handleContinuousScroll, 500);
    const debounceFlip = debounce(handlePageFlip, 100);

    const handleMouseEvent = (msg: MessageEvent | MouseEvent | WheelEvent) => {
        if (msg instanceof MessageEvent) {
            if (msg.data && msg.data.bookKey === bookKey) {
                if (msg.data.type === 'iframe-wheel') {
                    if (msg.data.ctrlKey) {
                        // TODO: 处理 Ctrl+滚轮缩放（需要事件分发器）
                        // eventDispatcher.dispatch('zoom-out/in', ...)
                    } else {
                        debounceScroll('mouse', -msg.data.deltaY, 0);
                        debounceFlip(msg);
                    }
                } else {
                    handlePageFlip(msg);
                }
            }
        } else if (msg instanceof WheelEvent) {
            debounceScroll('mouse', -msg.deltaY, 0);
        } else {
            handlePageFlip(msg);
        }
    };

    // 使用 $effect 管理事件监听器
    let cleanup: (() => void) | null = $state(null);

    $effect(() => {
        window.addEventListener('message', handleMouseEvent as EventListener);

        cleanup = () => {
            window.removeEventListener('message', handleMouseEvent as EventListener);
        };

        return cleanup;
    });

    const setup = () => {
        // setup 函数保持兼容性，但实际清理由 $effect 处理
        return () => {
            if (cleanup) {
                cleanup();
            }
        };
    };

    return {
        onClick: handlePageFlip as (msg: MouseEvent) => void,
        onWheel: handleMouseEvent as (event: WheelEvent) => void,
        setup
    };
}

/**
 * 触摸事件接口
 */
interface IframeTouch {
    clientX: number;
    clientY: number;
    screenX: number;
    screenY: number;
}

/**
 * 触摸事件数据接口
 */
interface IframeTouchEvent {
    timeStamp: number;
    targetTouches: IframeTouch[];
}

/**
 * useTouchEvent Hook
 * 处理触摸事件
 * 使用 $state 管理触摸状态，使用 $effect 管理事件监听器
 * @param bookKey 书籍键
 * @param handlePageFlip 页面翻转处理函数
 * @param handleContinuousScroll 连续滚动处理函数
 */
export function useTouchEvent(
    bookKey: string,
    handlePageFlip: (msg: CustomEvent) => void | Promise<void>,
    handleContinuousScroll: (source: ScrollSource, delta: number, threshold: number) => void
): {
    onTouchStart: (e: IframeTouchEvent | TouchEvent) => void;
    onTouchMove: (e: IframeTouchEvent | TouchEvent) => void;
    onTouchEnd: (e: IframeTouchEvent | TouchEvent) => void;
    setup: () => () => void;
} {
    // 使用 $state 管理触摸状态
    let touchStartRef = $state<IframeTouch | null>(null);
    let touchEndRef = $state<IframeTouch | null>(null);
    let touchStartTimeRef = $state<number | null>(null);
    let touchEndTimeRef = $state<number | null>(null);

    const onTouchStart = (e: IframeTouchEvent | TouchEvent) => {
        // @ts-ignore
        const touch = 'targetTouches' in e ? e.targetTouches[0] : e.targetTouches?.[0];
        if (!touch) return;
        touchStartRef = touch;
        touchStartTimeRef = 'timeStamp' in e ? e.timeStamp : Date.now();
    };

    const onTouchMove = (e: IframeTouchEvent | TouchEvent) => {
        if (!touchStartRef) return;
        // @ts-ignore
        const touch = 'targetTouches' in e ? e.targetTouches[0] : e.targetTouches?.[0];
        if (touch) {
            touchEndRef = touch;
            touchEndTimeRef = 'timeStamp' in e ? e.timeStamp : Date.now();
        }

        // 处理触摸移动时的 hover 状态
        const hoveredBookKey = readerStore.getHoveredBookKey();
        if (hoveredBookKey && touchEndRef && touchStartRef) {
            const readerSettings = readerStore.getReaderSettings(bookKey);
            const deltaY = touchEndRef.screenY - touchStartRef.screenY;
            const deltaX = touchEndRef.screenX - touchStartRef.screenX;
            if (readerSettings && !readerSettings.scrolled && !readerSettings.vertical) {
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
                    readerStore.setHoveredBookKey(null);
                }
            } else {
                readerStore.setHoveredBookKey(null);
            }
        }
    };

    const onTouchEnd = (e: IframeTouchEvent | TouchEvent) => {
        if (!touchStartRef) return;

        // @ts-ignore
        const touch = 'targetTouches' in e ? e.targetTouches[0] : e.targetTouches?.[0];
        if (touch) {
            touchEndRef = touch;
            touchEndTimeRef = 'timeStamp' in e ? e.timeStamp : Date.now();
        }

        const windowWidth = window.innerWidth;
        const touchStart = touchStartRef;
        const touchEnd = touchEndRef;
        const touchStartTime = touchStartTimeRef;
        const touchEndTime = touchEndTimeRef;

        if (touchEnd && touchStart) {
            const readerSettings = readerStore.getReaderSettings(bookKey);
            const bookData = bookDataStore.getBookData(bookKey);
            const deltaY = touchEnd.screenY - touchStart.screenY;
            const deltaX = touchEnd.screenX - touchStart.screenX;
            const deltaT = touchEndTime && touchStartTime ? touchEndTime - touchStartTime : 0;

            // 处理向上滑动切换 header/footer 显示
            if (
                deltaY < -10 &&
                Math.abs(deltaY) > Math.abs(deltaX) * 2 &&
                Math.abs(deltaX) < windowWidth * 0.3
            ) {
                if (
                    readerSettings &&
                    !readerSettings.scrolled &&
                    !readerSettings.vertical &&
                    bookData &&
                    (!bookData.isFixedLayout || (readerSettings.zoomLevel ?? 100) <= 100)
                ) {
                    const hoveredBookKey = readerStore.getHoveredBookKey();
                    readerStore.setHoveredBookKey(hoveredBookKey ? null : bookKey);
                }
            } else {
                const hoveredBookKey = readerStore.getHoveredBookKey();
                if (hoveredBookKey) {
                    readerStore.setHoveredBookKey(null);
                }
            }

            handlePageFlip(
                new CustomEvent('touch-swipe', {
                    detail: {
                        deltaX,
                        deltaY,
                        deltaT,
                        startX: touchStart.screenX,
                        startY: touchStart.screenY,
                        endX: touchEnd.screenX,
                        endY: touchEnd.screenY
                    }
                })
            );
            handleContinuousScroll('touch', deltaY, 30);
        }

        touchStartRef = null;
        touchEndRef = null;
    };

    const handleTouch = (msg: MessageEvent) => {
        if (msg.data && msg.data.bookKey === bookKey) {
            if (msg.data.type === 'iframe-touchstart') {
                onTouchStart(msg.data);
            } else if (msg.data.type === 'iframe-touchmove') {
                onTouchMove(msg.data);
            } else if (msg.data.type === 'iframe-touchend') {
                onTouchEnd(msg.data);
            }
        }
    };

    // 使用 $effect 管理事件监听器
    let cleanup: (() => void) | null = $state(null);

    $effect(() => {
        window.addEventListener('message', handleTouch);

        cleanup = () => {
            window.removeEventListener('message', handleTouch);
        };

        return cleanup;
    });

    const setup = () => {
        // setup 函数保持兼容性，但实际清理由 $effect 处理
        return () => {
            if (cleanup) {
                cleanup();
            }
        };
    };

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        setup
    };
}
