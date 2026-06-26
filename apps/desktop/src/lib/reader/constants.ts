/**
 * 阅读器常量定义
 * 包含默认设置、字体列表等
 */

import type {
    BookLayout,
    BookStyle,
    BookFont,
    BookLanguage,
    ViewConfig,
    TTSConfig,
    TranslatorConfig,
    ScreenConfig
} from './types';
import type { ReaderSettings } from './settings';

/**
 * 获取默认最大内联尺寸（列宽）
 */
function getDefaultMaxInlineSize(): number {
    if (typeof window === 'undefined') return 800;
    const width = window.innerWidth;
    // 桌面端：最大 800px，移动端：屏幕宽度 - 32px
    return width > 768 ? 800 : width - 32;
}

/**
 * 获取默认最大块尺寸（行高）
 */
function getDefaultMaxBlockSize(): number {
    if (typeof window === 'undefined') return 1200;
    const height = window.innerHeight;
    // 桌面端：最大 1200px，移动端：屏幕高度 - 32px
    return height > 768 ? 1200 : height - 32;
}

/**
 * 默认字体设置
 */
export const DEFAULT_BOOK_FONT: BookFont = {
    serifFont: 'Georgia',
    sansSerifFont: 'Arial',
    monospaceFont: 'Consolas',
    defaultFont: 'Serif',
    defaultCJKFont: 'SimSun',
    defaultFontSize: 16,
    minimumFontSize: 8,
    fontWeight: 400
};

/**
 * 默认布局设置
 */
export const DEFAULT_BOOK_LAYOUT: BookLayout = {
    marginTopPx: 44,
    marginBottomPx: 44,
    marginLeftPx: 16,
    marginRightPx: 16,
    gapPercent: 5,
    scrolled: false,
    disableClick: false,
    swapClickArea: false,
    disableDoubleClick: false,
    fullscreenClickArea: false,
    volumeKeysToFlip: false,
    arrowKeyNavigationMode: 'vertical-section-horizontal-page',
    continuousScroll: false,
    maxColumnCount: 2,
    maxInlineSize: getDefaultMaxInlineSize(),
    maxBlockSize: getDefaultMaxBlockSize(),
    animated: false,
    isEink: false,
    writingMode: 'auto',
    vertical: false,
    rtl: false,
    scrollingOverlap: 0,
    allowScript: false
};

/**
 * 默认样式设置
 */
export const DEFAULT_BOOK_STYLE: BookStyle = {
    zoomLevel: 100,
    paragraphMargin: 1,
    lineHeight: 1.6,
    wordSpacing: 0,
    letterSpacing: 0,
    textIndent: 0,
    fullJustification: true,
    hyphenation: true,
    invertImgColorInDark: false,
    theme: 'light',
    overrideFont: false,
    overrideLayout: false,
    overrideColor: false,
    backgroundTextureId: '',
    backgroundOpacity: 1,
    backgroundSize: 'cover',
    codeHighlighting: false,
    codeLanguage: 'auto-detect',
    userStylesheet: '',
    userUIStylesheet: '',
    zoomMode: 'fit-page',
    spreadMode: 'auto',
    keepCoverSpread: true
};

/**
 * 默认视图配置
 */
export const DEFAULT_VIEW_CONFIG: ViewConfig = {
    sideBarTab: 'toc',
    uiLanguage: '',
    sortedTOC: false,
    doubleBorder: false,
    borderColor: 'red',
    showHeader: true,
    showFooter: true,
    showRemainingTime: false,
    showRemainingPages: false,
    showProgressInfo: true,
    showBarsOnScroll: false,
    showMarginsOnScroll: false,
    progressStyle: 'fraction'
};

/**
 * 默认 TTS 配置
 */
export const DEFAULT_TTS_CONFIG: TTSConfig = {
    ttsRate: 1.3,
    ttsVoice: '',
    ttsLocation: '',
    showTTSBar: false,
    ttsHighlightOptions: { style: 'highlight', color: 'gray' }
};

/**
 * 默认翻译配置
 */
export const DEFAULT_TRANSLATOR_CONFIG: TranslatorConfig = {
    translationEnabled: false,
    translationProvider: 'deepl',
    translateTargetLang: '',
    showTranslateSource: true,
    ttsReadAloudText: ''
};

/**
 * 默认屏幕配置
 */
export const DEFAULT_SCREEN_CONFIG: ScreenConfig = {
    screenOrientation: 'auto'
};

/**
 * 默认书籍语言设置
 */
export const DEFAULT_BOOK_LANGUAGE: BookLanguage = {
    replaceQuotationMarks: false,
    convertChineseVariant: 'none'
};

/**
 * 移动端阅读器设置覆盖
 */
export const DEFAULT_MOBILE_READER_SETTINGS: Partial<ReaderSettings> = {
    fullJustification: false,
    animated: true,
    defaultFont: 'Sans-serif',
    marginBottomPx: 16,
    disableDoubleClick: true
};

/**
 * CJK 语言阅读器设置覆盖
 */
export const DEFAULT_CJK_READER_SETTINGS: Partial<ReaderSettings> = {
    fullJustification: true,
    textIndent: 2,
    paragraphMargin: 1,
    lineHeight: 1.6
};

/**
 * 固定布局阅读器设置覆盖
 */
export const DEFAULT_FIXED_LAYOUT_READER_SETTINGS: Partial<ReaderSettings> = {
    overrideColor: false // 保留原始 PDF/CBZ 颜色
};

/**
 * 字体列表
 */
export const SERIF_FONTS = [
    'Georgia',
    'Times New Roman',
    'Bitter',
    'Literata',
    'Merriweather',
    'Vollkorn'
];

export const SANS_SERIF_FONTS = [
    'Arial',
    'Helvetica',
    'Roboto',
    'Noto Sans',
    'Open Sans',
    'Segoe UI'
];

export const MONOSPACE_FONTS = ['Consolas', 'Courier New', 'Fira Code', 'Lucida Console', 'Monaco'];

export const CJK_SERIF_FONTS = [
    'SimSun',
    'SimHei',
    'KaiTi',
    'FangSong',
    'Microsoft YaHei',
    'Source Han Serif CN'
];

export const CJK_SANS_SERIF_FONTS = [
    'SimHei',
    'Microsoft YaHei',
    'Noto Sans SC',
    'Noto Sans TC',
    'Source Han Sans CN'
];

export const FALLBACK_FONTS = ['serif', 'sans-serif', 'monospace'];

/**
 * 获取默认阅读器设置
 * 合并所有默认设置，应用移动端和 CJK 覆盖
 */
export function getDefaultReaderSettings(
    isMobile: boolean = false,
    isCJK: boolean = false
): ReaderSettings {
    const base: ReaderSettings = {
        ...DEFAULT_BOOK_LAYOUT,
        ...DEFAULT_BOOK_STYLE,
        ...DEFAULT_BOOK_FONT,
        ...DEFAULT_BOOK_LANGUAGE,
        ...DEFAULT_VIEW_CONFIG,
        ...DEFAULT_TTS_CONFIG,
        ...DEFAULT_TRANSLATOR_CONFIG,
        ...DEFAULT_SCREEN_CONFIG
    };

    if (isMobile) {
        Object.assign(base, DEFAULT_MOBILE_READER_SETTINGS);
    }

    if (isCJK) {
        Object.assign(base, DEFAULT_CJK_READER_SETTINGS);
    }

    return base;
}
