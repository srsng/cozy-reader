/**
 * Reader 设置定义（扁平化结构，完全参考 readest）
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
} from '../types';
import {
    DEFAULT_BOOK_FONT,
    DEFAULT_BOOK_LAYOUT,
    DEFAULT_BOOK_STYLE,
    DEFAULT_BOOK_LANGUAGE,
    DEFAULT_VIEW_CONFIG,
    DEFAULT_TTS_CONFIG,
    DEFAULT_TRANSLATOR_CONFIG,
    DEFAULT_SCREEN_CONFIG
} from '../constants';

/**
 * Reader 设置主接口（扁平化设计，完全参考 readest）
 * 直接合并所有子设置块的字段
 */
export interface ReaderSettings
    extends BookLayout,
        BookStyle,
        BookFont,
        BookLanguage,
        ViewConfig,
        TTSConfig,
        TranslatorConfig,
        ScreenConfig {}

/**
 * 默认 Reader 设置
 */
export const DEFAULT_READER_SETTINGS: ReaderSettings = {
    ...DEFAULT_BOOK_LAYOUT,
    ...DEFAULT_BOOK_STYLE,
    ...DEFAULT_BOOK_FONT,
    ...DEFAULT_BOOK_LANGUAGE,
    ...DEFAULT_VIEW_CONFIG,
    ...DEFAULT_TTS_CONFIG,
    ...DEFAULT_TRANSLATOR_CONFIG,
    ...DEFAULT_SCREEN_CONFIG
};
