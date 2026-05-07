/**
 * 文本选择 Hook
 * 用于处理文本选择、弹窗显示等逻辑
 *
 * 这是一个 Svelte 5 的 rune-based hook，使用 .svelte.ts 扩展名以支持 runes
 */

import { readerStore } from '../stores/readerStore';
import { bookDataStore } from '../stores/bookDataStore';
import { transformContent } from '../services/TransformService';
import { getTextFromRange, type TextSelection } from '../utils/sel';
import type { FoliateViewElement } from '../types';

/**
 * useTextSelector Hook
 * 处理文本选择相关的事件
 * 使用 $state 管理选择状态，使用 $effect 管理事件监听
 * @param bookKey 书籍键
 * @param setSelection 设置选择的回调函数
 * @param handleDismissPopup 关闭弹窗的回调函数
 */
export function useTextSelector(
    bookKey: string,
    setSelection: (selection: TextSelection | null) => void,
    handleDismissPopup: () => void
): {
    handleScroll: () => void;
    handleTouchStart: () => void;
    handleTouchEnd: () => void;
    handlePointerdown: (e: PointerEvent) => void;
    handlePointerup: (doc: Document, index: number, ev: PointerEvent) => void;
    handleSelectionchange: (doc: Document, index: number) => void;
    handleShowPopup: (showPopup: boolean) => void;
    handleUpToPopup: () => void;
    handleContextmenu: (event: Event) => boolean | void;
    setup: () => () => void;
} {
    const view = readerStore.getView(bookKey);
    const bookData = bookDataStore.getBookData(bookKey);

    // 使用 $derived 计算主要语言
    const primaryLang = $derived.by(() => {
        return bookData?.bookDoc?.metadata?.language
            ? Array.isArray(bookData.bookDoc.metadata.language)
                ? bookData.bookDoc.metadata.language[0]
                : typeof bookData.bookDoc.metadata.language === 'string'
                  ? bookData.bookDoc.metadata.language
                  : 'en'
            : 'en';
    });

    // 使用 $state 管理选择状态
    let isPopuped = $state(false);
    let isUpToPopup = $state(false);
    let isTextSelected = $state(false);
    let isTouchStarted = $state(false);
    let selectionPosition = $state<number | null>(null);
    let lastPointerType = $state('mouse');
    let textSelected = $state(false);

    const isValidSelection = (sel: Selection) => {
        return sel && sel.toString().trim().length > 0 && sel.rangeCount > 0;
    };

    const getAnnotationText = async (range: Range): Promise<string> => {
        const text = getTextFromRange(range, primaryLang.startsWith('ja') ? ['rt'] : []);
        const transformed = await transformContent({
            bookKey,
            readerSettings: readerStore.getReaderSettings(bookKey)!,
            content: text,
            transformers: ['punctuation'],
            reversePunctuationTransform: true
        });
        return transformed;
    };

    const makeSelection = async (sel: Selection, index: number, rebuildRange = false) => {
        isTextSelected = true;
        textSelected = true;
        const range = sel.getRangeAt(0);
        if (rebuildRange) {
            sel.removeAllRanges();
            sel.addRange(range);
        }
        setSelection({
            key: bookKey,
            text: await getAnnotationText(range),
            range,
            index
        });
    };

    // FIXME: extremely hacky way to dismiss system selection tools on iOS
    const makeSelectionOnIOS = async (sel: Selection, index: number) => {
        isTextSelected = true;
        textSelected = true;
        const range = sel.getRangeAt(0);
        setTimeout(() => {
            sel.removeAllRanges();
            setTimeout(async () => {
                if (!isTextSelected) return;
                sel.addRange(range);
                setSelection({
                    key: bookKey,
                    text: await getAnnotationText(range),
                    range,
                    index
                });
            }, 30);
        }, 30);
    };

    const handleSelectionchange = (doc: Document, index: number) => {
        // Available on iOS, Android and Desktop, fired when the selection is changed
        // Ideally the popup only shows when the selection is done,
        const sel = doc.getSelection() as Selection;
        // TODO: 检测 iOS/Android 平台
        // if (osPlatform === 'ios' || appService?.isIOSApp) return;
        if (!isValidSelection(sel)) {
            if (!isUpToPopup) {
                handleDismissPopup();
                isTextSelected = false;
                textSelected = false;
            }
            if (isPopuped) {
                isUpToPopup = false;
            }
            return;
        }

        // On Android no proper events are fired to notify selection done,
        // we make the popup show when the selection is changed
        // note that selection may be initiated by a tts speak
        // TODO: 检测 Android 平台
        // if (isTouchStarted && osPlatform === 'android') {
        //     makeSelection(sel, index, false);
        // }
        isUpToPopup = true;
    };

    const isPointerInsideSelection = (selection: Selection, ev: PointerEvent) => {
        if (selection.rangeCount === 0) return false;
        const range = selection.getRangeAt(0);
        const rects = range.getClientRects();
        const padding = 80;
        for (let i = 0; i < rects.length; i++) {
            const rect = rects[i]!;
            if (
                ev.clientX >= rect.left - padding &&
                ev.clientX <= rect.right + padding &&
                ev.clientY >= rect.top - padding &&
                ev.clientY <= rect.bottom + padding
            ) {
                return true;
            }
        }
        return false;
    };

    const handlePointerdown = (e: PointerEvent) => {
        lastPointerType = e.pointerType;
    };

    const handlePointerup = (doc: Document, index: number, ev: PointerEvent) => {
        // Available on iOS and Desktop, fired at touchend or mouseup
        // Note that on Android, pointerup event is fired after an additional touch event
        const sel = doc.getSelection() as Selection;
        if (isValidSelection(sel) && isPointerInsideSelection(sel, ev)) {
            // TODO: 检测 iOS 平台
            // if (osPlatform === 'ios' || appService?.isIOSApp) {
            //     makeSelectionOnIOS(sel, index);
            // } else {
            makeSelection(sel, index, true);
            // }
        }
    };

    const handleTouchStart = () => {
        isTouchStarted = true;
    };

    const handleTouchEnd = () => {
        isTouchStarted = false;
    };

    const handleScroll = () => {
        // Prevent the container from scrolling when text is selected in paginated mode
        // FIXME: this is a workaround for issue #873
        // TODO: support text selection across pages
        const readerSettings = readerStore.getReaderSettings(bookKey);
        if (
            // TODO: 检测 Android 平台
            // appService?.isAndroidApp &&
            isTextSelected &&
            !readerSettings?.scrolled &&
            view?.renderer?.start !== undefined &&
            selectionPosition !== null
        ) {
            console.warn('Keep container position', selectionPosition);
            // TODO: 设置 containerPosition
            // view.renderer.containerPosition = selectionPosition;
        }
    };

    const handleShowPopup = (showPopup: boolean) => {
        setTimeout(
            () => {
                if (showPopup && !isPopuped) {
                    isUpToPopup = false;
                }
                isPopuped = showPopup;
            },
            // TODO: 检测平台
            // ['android', 'ios'].includes(osPlatform) || appService?.isIOSApp ? 0 : 500,
            500
        );
    };

    const handleUpToPopup = () => {
        isUpToPopup = true;
    };

    const handleContextmenu = (event: Event) => {
        // TODO: 检测移动平台
        // if (appService?.isMobile) {
        //     event.preventDefault();
        //     event.stopPropagation();
        //     return false;
        // } else if (lastPointerType === 'touch' || lastPointerType === 'pen') {
        //     event.preventDefault();
        //     event.stopPropagation();
        //     return false;
        // }
        return;
    };

    // 使用 $effect 监听 textSelected 变化，更新 selectionPosition
    $effect(() => {
        if (isTextSelected && !selectionPosition) {
            selectionPosition = view?.renderer?.start ?? null;
        } else if (!isTextSelected) {
            selectionPosition = null;
        }
    });

    // 监听 iframe-single-click 事件
    const handleSingleClick = (): boolean => {
        if (isUpToPopup) {
            isUpToPopup = false;
            return true;
        }
        if (isTextSelected) {
            handleDismissPopup();
            isTextSelected = false;
            textSelected = false;
            view?.deselect();
            return true;
        }
        if (isPopuped) {
            handleDismissPopup();
            return true;
        }
        return false;
    };

    // 使用 $effect 管理事件监听器和 interval
    let cleanup: (() => void) | null = $state(null);

    $effect(() => {
        // 监听 window message 事件（来自 iframe）
        const messageHandler = (event: MessageEvent) => {
            if (
                event.data &&
                event.data.type === 'iframe-single-click' &&
                event.data.bookKey === bookKey
            ) {
                handleSingleClick();
            }
        };
        window.addEventListener('message', messageHandler);

        // 定期更新 selectionPosition
        const intervalId = setInterval(() => {
            if (isTextSelected && !selectionPosition) {
                selectionPosition = view?.renderer?.start ?? null;
            } else if (!isTextSelected) {
                selectionPosition = null;
            }
        }, 100);

        cleanup = () => {
            window.removeEventListener('message', messageHandler);
            clearInterval(intervalId);
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
        handleScroll,
        handleTouchStart,
        handleTouchEnd,
        handlePointerdown,
        handlePointerup,
        handleSelectionchange,
        handleShowPopup,
        handleUpToPopup,
        handleContextmenu,
        setup
    };
}
