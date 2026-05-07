/**
 * 视图边距工具函数
 * 用于计算视图的边距（insets）
 */

import type { ReaderSettings } from '../settings';

export interface Insets {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

/**
 * 获取视图边距
 * @param readerSettings 阅读器设置
 * @returns 边距对象
 */
export const getViewInsets = (readerSettings: ReaderSettings): Insets => {
    const showHeader = readerSettings.showHeader ?? false;
    const showFooter = readerSettings.showFooter ?? false;
    const isVertical =
        readerSettings.vertical || (readerSettings.writingMode?.includes('vertical') ?? false);
    const fullMarginTopPx = readerSettings.marginPx ?? readerSettings.marginTopPx ?? 0;
    const compactMarginTopPx =
        readerSettings.compactMarginPx ?? readerSettings.compactMarginTopPx ?? 0;
    const fullMarginBottomPx = readerSettings.marginBottomPx ?? 0;
    const compactMarginBottomPx = readerSettings.compactMarginBottomPx ?? 0;
    const fullMarginLeftPx = readerSettings.marginLeftPx ?? 0;
    const fullMarginRightPx = readerSettings.marginRightPx ?? 0;
    const compactMarginLeftPx = readerSettings.compactMarginLeftPx ?? 0;
    const compactMarginRightPx = readerSettings.compactMarginRightPx ?? 0;

    return {
        top: showHeader && !isVertical ? fullMarginTopPx : compactMarginTopPx,
        right: showHeader && isVertical ? fullMarginRightPx : compactMarginRightPx,
        bottom: showFooter && !isVertical ? fullMarginBottomPx : compactMarginBottomPx,
        left: showFooter && isVertical ? fullMarginLeftPx : compactMarginLeftPx
    };
};
