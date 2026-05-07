import type { ReaderSettings } from '../settings';

/**
 * 获取实际的最大内联尺寸（列宽）
 * 根据垂直模式和屏幕宽高比动态调整
 */
export const getMaxInlineSize = (readerSettings: ReaderSettings): number => {
    const isVertical = readerSettings.vertical ?? false;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const screenAspectRatio = isVertical ? screenHeight / screenWidth : screenWidth / screenHeight;
    const isUnfoldedScreen =
        screenAspectRatio < 1.3 && screenAspectRatio > 0.77 && screenWidth > 600;

    return isVertical
        ? Math.max(screenWidth, screenHeight, 720)
        : isUnfoldedScreen
          ? (readerSettings.maxInlineSize ?? 800) * 0.8
          : (readerSettings.maxInlineSize ?? 800);
};
