/**
 * Reader 模块统一导出
 * 提供阅读器相关的所有公共 API
 */

// 类型定义
export type {
    BookFormat,
    Location,
    TOCItem,
    SectionItem,
    BookMetadata,
    BookDoc,
    WritingMode,
    PageInfo,
    TimeInfo,
    BookLayout,
    BookStyle,
    BookFont,
    BookLanguage,
    ViewConfig,
    TTSConfig,
    TranslatorConfig,
    ScreenConfig,
    BookConfig,
    TTSHighlightOptions,
    ConvertChineseVariant
} from './types';

export type { ReaderSettings } from './settings';

export type {
    BookProgress,
    FoliateViewElement,
    BookNote,
    BookNoteType,
    BooknoteGroup,
    BookSearchConfig,
    SearchExcerpt,
    BookSearchMatch,
    BookSearchResult
} from './types';

export { FIXED_LAYOUT_FORMATS } from './types';

// 常量
export {
    DEFAULT_BOOK_FONT,
    DEFAULT_BOOK_LAYOUT,
    DEFAULT_BOOK_STYLE,
    DEFAULT_VIEW_CONFIG,
    DEFAULT_TTS_CONFIG,
    DEFAULT_TRANSLATOR_CONFIG,
    DEFAULT_SCREEN_CONFIG,
    DEFAULT_BOOK_LANGUAGE,
    DEFAULT_MOBILE_READER_SETTINGS,
    DEFAULT_CJK_READER_SETTINGS,
    DEFAULT_FIXED_LAYOUT_READER_SETTINGS,
    SERIF_FONTS,
    SANS_SERIF_FONTS,
    MONOSPACE_FONTS,
    CJK_SERIF_FONTS,
    CJK_SANS_SERIF_FONTS,
    FALLBACK_FONTS,
    getDefaultReaderSettings
} from './constants';

export { DEFAULT_READER_SETTINGS } from './settings';

// 文档加载器
export { DocumentLoader, getDirection } from './document';

// 服务
export { DocumentService } from './services/DocumentService';
export {
    TransformService,
    transformContent,
    type TransformContext
} from './services/TransformService';
export {
    transformStylesheet,
    applyImageStyle,
    applyFixedlayoutStyles
} from './services/TransformService';
export {
    mountAdditionalFonts,
    mountCustomFont,
    isCJKLang,
    type CustomFont,
    type FontFormat
} from './services/FontService';
export { manageSyntaxHighlighting } from './services/HighlightService';
export { searchService, SearchService } from './services/SearchService';
export { annotationService, AnnotationService } from './services/AnnotationService';

// 样式生成
export { getStyles, applyTranslationStyle } from './style';

// Store
export { readerStore } from './stores/readerStore';
export type { ViewState } from './stores/readerStore';
export { bookDataStore } from './stores/bookDataStore';
export type { BookData } from './stores/bookDataStore';
export { notebookStore } from './stores/notebookStore';
export { sidebarStore } from './stores/sidebarStore';
export type { SidebarTab } from './stores/sidebarStore';
export { parallelViewStore } from './stores/parallelViewStore';

// 转换工具
export {
    commentToBookNote,
    bookNoteToComment,
    commentsToBookNotes,
    bookNotesToComments
} from './utils/commentConverter';

// 文本选择工具
export {
    getPosition,
    getPopupPosition,
    getTextFromRange,
    type TextSelection,
    type Position,
    type PositionDir,
    type Point,
    type Rect,
    type Frame
} from './utils/sel';

// Hooks
export { useTextSelector } from './hooks/useTextSelector';
export { useAutoSaveBookCover } from './hooks/useAutoSaveBookCover';
export { useBooksManager } from './hooks/useBooksManager';
export type { BooksManagerOptions } from './hooks/useBooksManager';
export {
    useBookKeybindings,
    createDefaultKeybindingHandlers
} from './hooks/useBookKeybindings';
export type {
    BookKeybindingConfig,
    BookKeybindingHandlers
} from './hooks/useBookKeybindings';
