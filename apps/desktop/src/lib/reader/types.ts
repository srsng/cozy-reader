/**
 * foliate-js 阅读器相关的类型定义
 * 这些类型用于与 foliate-js 库交互，与数据库 Book 类型分离
 */

import type {
    BookFormat,
    CommentType,
    ReadingProgress,
    PositionInfo,
    Comment
} from '@cozy-reader/database';
export type { BookFormat, ReadingProgress, PositionInfo };

/**
 * 位置信息
 * 基于位置单位（sizePerLoc）计算的阅读位置索引
 */
export type Location = {
    /** 当前位置索引（从 0 开始，基于位置单位计算） */
    current: number;
    /** 下一个位置索引（基于位置单位计算） */
    next: number;
    /** 总位置数（基于位置单位计算） */
    total: number;
};

/**
 * 目录项
 */
export interface TOCItem {
    /** 目录项 ID（数字标识符） */
    id: number;
    /** 目录项标签（章节标题文本） */
    label: string;
    /** 章节链接地址（href，指向章节文件） */
    href: string;
    /** CFI 位置标识（可选，Canonical Fragment Identifier） */
    cfi?: string;
    /** 位置信息（可选，章节内的位置索引） */
    location?: Location;
    /** 子目录项列表（可选，嵌套目录结构） */
    subitems?: TOCItem[];
}

/**
 * 章节项
 */
export interface SectionItem {
    /** 章节 ID（字符串标识符） */
    id: string;
    /** CFI 位置标识（Canonical Fragment Identifier） */
    cfi: string;
    /** 章节大小（字节数） */
    size: number;
    /** 线性标识（'yes' | 'no'，表示是否线性阅读） */
    linear: string;
    /** 位置信息（可选，章节内的位置索引） */
    location?: Location;
    /** 页面展开方式（可选，左/右/居中/无） */
    pageSpread?: 'left' | 'right' | 'center' | '';
    /** 创建文档的方法（异步返回 Document 对象） */
    createDocument: () => Promise<Document>;
}

/**
 * 书籍元数据（foliate-js 格式）
 */
export type BookMetadata = {
    /** 书名 */
    title: string | Record<string, string>;
    /** 作者 */
    author: string | Array<{ name?: string | Record<string, string> }> | Record<string, string>;
    /** 语言 */
    language: string | string[];
    /** 编辑者（可选） */
    editor?: string;
    /** 出版商（可选） */
    publisher?: string;
    /** 出版日期（可选） */
    published?: string;
    /** 描述（可选） */
    description?: string;
    /** 主题（可选） */
    subject?: string | string[] | Array<{ name?: string | Record<string, string> }>;
    /** 标识符（可选） */
    identifier?: string;
    /** 副标题（可选） */
    subtitle?: string;
    /** 系列名称（可选） */
    series?: string;
    /** 系列索引（可选） */
    seriesIndex?: number;
    /** 系列总数（可选） */
    seriesTotal?: number;
    /** 封面图片文件路径（可选） */
    coverImageFile?: string;
    /** 封面图片 URL（可选） */
    coverImageUrl?: string;
    /** 封面图片 Blob URL（可选） */
    coverImageBlobUrl?: string;
};

/**
 * BookDoc 接口 - foliate-js 书籍文档对象
 */
export interface BookDoc {
    /** 书籍元数据 */
    metadata: BookMetadata;
    /** 渲染配置（可选） */
    rendition?: {
        /** 布局类型：预分页或可重排 */
        layout?: 'pre-paginated' | 'reflowable';
        /** 展开模式：自动或无 */
        spread?: 'auto' | 'none';
        /** 视口尺寸 */
        viewport?: { width: number; height: number };
    };
    /** 目录路径 */
    dir: string;
    /** 目录列表（可选） */
    toc?: Array<TOCItem>;
    /** 章节列表（可选） */
    sections?: Array<SectionItem>;
    /** 转换目标事件对象（可选） */
    transformTarget?: EventTarget;
    /** 分割目录链接的方法 */
    splitTOCHref(href: string): Array<string | number>;
    /** 获取封面图片的方法 */
    getCover(): Promise<Blob | null>;
    /** 解析链接的方法（可选） */
    resolveHref?(href: string): { index: number; anchor: (doc: Document) => Range | Node };
    /** 解析 CFI 的方法（可选） */
    resolveCFI?(cfi: string): { index: number; anchor: (doc: Document) => Range | Node };
    /** 判断是否为外部链接的方法（可选） */
    isExternal?(href: string): boolean;
    /** 销毁方法（可选） */
    destroy?(): void;
}

/**
 * 写作模式
 */
export type WritingMode = 'auto' | 'horizontal-tb' | 'horizontal-rl' | 'vertical-rl';

/**
 * 页面信息
 * 表示页码信息，页码从 1 开始
 */
export interface PageInfo {
    /** 当前页码（从 1 开始） */
    current: number;
    /** 下一页页码（可选，从 1 开始） */
    next?: number;
    /** 总页数 */
    total: number;
}

/**
 * 时间信息（剩余阅读时间，单位：分钟）
 * 基于阅读速度和剩余内容计算
 */
export interface TimeInfo {
    /** 当前章节剩余阅读时间（分钟，基于章节剩余内容和阅读速度） */
    section: number;
    /** 全书剩余阅读时间（分钟，基于全书剩余内容和阅读速度） */
    total: number;
}

/**
 * 书籍布局设置
 */
export interface BookLayout {
    /** 统一边距（像素，可选，如果设置则覆盖各方向边距） */
    marginPx?: number;
    /** 上边距（像素） */
    marginTopPx: number;
    /** 下边距（像素） */
    marginBottomPx: number;
    /** 左边距（像素） */
    marginLeftPx: number;
    /** 右边距（像素） */
    marginRightPx: number;
    /** 紧凑模式统一边距（像素，可选） */
    compactMarginPx?: number;
    /** 紧凑模式上边距（像素，可选） */
    compactMarginTopPx?: number;
    /** 紧凑模式下边距（像素，可选） */
    compactMarginBottomPx?: number;
    /** 紧凑模式左边距（像素，可选） */
    compactMarginLeftPx?: number;
    /** 紧凑模式右边距（像素，可选） */
    compactMarginRightPx?: number;
    /** 列间距百分比（0-100，用于多列布局） */
    gapPercent: number;
    /** 是否启用滚动模式（true=滚动，false=翻页） */
    scrolled: boolean;
    /** 是否禁用点击翻页 */
    disableClick: boolean;
    /** 是否交换左右点击区域（用于 RTL 或特殊布局） */
    swapClickArea: boolean;
    /** 是否禁用双击缩放 */
    disableDoubleClick: boolean;
    /** 全屏点击区域（可选，全屏模式下是否启用点击区域） */
    fullscreenClickArea?: boolean;
    /** 是否使用音量键翻页 */
    volumeKeysToFlip: boolean;
    /** 是否启用连续滚动（无分页） */
    continuousScroll: boolean;
    /** 最大列数（多列布局时的最大列数） */
    maxColumnCount: number;
    /** 最大行内尺寸（像素，限制文本行的最大宽度） */
    maxInlineSize: number;
    /** 最大块尺寸（像素，限制文本块的最大高度） */
    maxBlockSize: number;
    /** 是否启用翻页动画 */
    animated: boolean;
    /** 是否为电子墨水屏（影响渲染优化） */
    isEink: boolean;
    /** 写作模式（文本方向） */
    writingMode: WritingMode;
    /** 是否垂直排版（true=竖排，false=横排） */
    vertical: boolean;
    /** 是否从右到左（RTL，用于阿拉伯语、希伯来语等） */
    rtl: boolean;
    /** 滚动重叠量（像素，连续滚动时页面间的重叠距离） */
    scrollingOverlap: number;
    /** 是否允许执行脚本（安全设置） */
    allowScript: boolean;
}

/**
 * 书籍样式设置
 */
export interface BookStyle {
    /** 缩放级别（1.0 为正常，大于 1.0 为放大） */
    zoomLevel: number;
    /** 段落间距（em 单位，相对于字体大小） */
    paragraphMargin: number;
    /** 行高（倍数，1.5 表示 1.5 倍行高） */
    lineHeight: number;
    /** 词间距（em 单位） */
    wordSpacing: number;
    /** 字间距（em 单位） */
    letterSpacing: number;
    /** 首行缩进（em 单位） */
    textIndent: number;
    /** 是否两端对齐（分散对齐） */
    fullJustification: boolean;
    /** 是否启用断字（自动换行时断字） */
    hyphenation: boolean;
    /** 深色模式下是否反转图片颜色（提高可读性） */
    invertImgColorInDark: boolean;
    /** 主题名称（CSS 主题标识符） */
    theme: string;
    /** 是否覆盖书籍的字体设置 */
    overrideFont: boolean;
    /** 是否覆盖书籍的布局设置 */
    overrideLayout: boolean;
    /** 是否覆盖书籍的颜色设置 */
    overrideColor: boolean;
    /** 背景纹理 ID（背景图案标识符） */
    backgroundTextureId: string;
    /** 背景透明度（0-1，1 为完全不透明） */
    backgroundOpacity: number;
    /** 背景尺寸（CSS 值，如 'cover'、'contain' 或具体尺寸） */
    backgroundSize: string;
    /** 是否启用代码语法高亮 */
    codeHighlighting: boolean;
    /** 代码语言（用于语法高亮，如 'javascript'、'python'） */
    codeLanguage: string;
    /** 用户自定义样式表（CSS 字符串） */
    userStylesheet: string;
    /** 用户自定义 UI 样式表（CSS 字符串，用于界面元素） */
    userUIStylesheet: string;
    /** 固定布局专用：缩放模式（适合页面/适合宽度/原始大小/自定义） */
    zoomMode: 'fit-page' | 'fit-width' | 'original-size' | 'custom';
    /** 固定布局专用：展开模式（自动/无展开） */
    spreadMode: 'auto' | 'none';
    /** 固定布局专用：是否保持封面展开 */
    keepCoverSpread: boolean;
}

/**
 * 书籍字体设置
 */
export interface BookFont {
    /** 衬线字体名称（用于正文） */
    serifFont: string;
    /** 无衬线字体名称（用于标题等） */
    sansSerifFont: string;
    /** 等宽字体名称（用于代码） */
    monospaceFont: string;
    /** 默认字体名称（用户选择的默认字体） */
    defaultFont: string;
    /** 默认中日韩字体名称（用于 CJK 文本） */
    defaultCJKFont: string;
    /** 默认字体大小（像素值） */
    defaultFontSize: number;
    /** 最小字体大小（像素值，用于缩放限制） */
    minimumFontSize: number;
    /** 字体粗细（100-900，400 为正常） */
    fontWeight: number;
}

/**
 * 视图配置
 */
export interface ViewConfig {
    /** 侧边栏标签页（'toc' | 'search' | 'notes'） */
    sideBarTab: string;
    /** UI 语言代码（如 'zh-CN'、'en-US'） */
    uiLanguage: string;
    /** 是否对目录进行排序 */
    sortedTOC: boolean;
    /** 是否显示双边框（页面边框） */
    doubleBorder: boolean;
    /** 边框颜色（CSS 颜色值） */
    borderColor: string;
    /** 是否显示头部工具栏 */
    showHeader: boolean;
    /** 是否显示底部工具栏 */
    showFooter: boolean;
    /** 是否显示剩余阅读时间 */
    showRemainingTime: boolean;
    /** 是否显示剩余页数 */
    showRemainingPages: boolean;
    /** 是否显示进度信息 */
    showProgressInfo: boolean;
    /** 滚动时是否自动显示工具栏 */
    showBarsOnScroll: boolean;
    /** 滚动时是否显示边距指示 */
    showMarginsOnScroll: boolean;
    /** 进度显示样式（百分比或分数） */
    progressStyle: 'percentage' | 'fraction';
}

/**
 * TTS 高亮选项
 */
export type TTSHighlightOptions = {
    /** 高亮样式（高亮/下划线/删除线/波浪线/轮廓） */
    style: 'highlight' | 'underline' | 'strikethrough' | 'squiggly' | 'outline';
    /** 高亮颜色（CSS 颜色值） */
    color: string;
};

/**
 * TTS 配置
 */
export interface TTSConfig {
    /** TTS 语速（0.1 到 10.0，1.0 为正常语速） */
    ttsRate: number;
    /** TTS 语音标识符（系统语音名称或 ID） */
    ttsVoice: string;
    /** TTS 位置（CFI 字符串，表示 TTS 开始位置） */
    ttsLocation: string;
    /** 是否显示 TTS 工具栏 */
    showTTSBar: boolean;
    /** TTS 高亮选项 */
    ttsHighlightOptions: TTSHighlightOptions;
}

/**
 * 翻译配置
 */
export interface TranslatorConfig {
    /** 是否启用翻译功能 */
    translationEnabled: boolean;
    /** 翻译提供商标识符（如 'google'、'baidu'） */
    translationProvider: string;
    /** 翻译目标语言代码（如 'en'、'zh'） */
    translateTargetLang: string;
    /** 是否显示翻译源语言 */
    showTranslateSource: boolean;
    /** TTS 朗读文本（选中的文本，用于朗读翻译结果） */
    ttsReadAloudText: string;
}

/**
 * 屏幕配置
 */
export interface ScreenConfig {
    /** 屏幕方向锁定（自动/竖屏/横屏） */
    screenOrientation: 'auto' | 'portrait' | 'landscape';
}

/**
 * 中文繁简转换类型
 */
export type ConvertChineseVariant =
    | 'none'
    | 's2t'
    | 't2s'
    | 's2tw'
    | 's2hk'
    | 's2twp'
    | 'tw2s'
    | 'hk2s'
    | 'tw2sp';

/**
 * 书籍语言设置
 */
export interface BookLanguage {
    /** 是否替换引号（将直引号替换为弯引号） */
    replaceQuotationMarks: boolean;
    /** 中文繁简转换类型（不转换/简体转繁体/繁体转简体等） */
    convertChineseVariant: ConvertChineseVariant;
}

/**
 * 笔记类型（使用数据库定义）
 */
export type BookNoteType = CommentType;

/**
 * 书籍笔记（foliate-js 运行时格式）
 * 基于数据库 Comment 类型，用于与 foliate-js 交互
 *
 * 字段映射关系：
 * - BookNote.note ↔ Comment.content（注释内容）
 * - BookNote.text ↔ Comment.selectedText（选中的文本）
 * - BookNote.type ↔ Comment.commentType（注释类型）
 * - BookNote.cfi ↔ Comment.positionInfo.cfi（位置标识）
 * - BookNote.color ↔ Comment.color（颜色字符串）
 * - BookNote.id ↔ Comment.externalId 或 Comment.id（字符串 ID）
 */
export interface BookNote {
    /** 运行时缓存字段，不持久化 */
    bookHash?: string;
    /** 字符串 ID，对应 Comment.externalId 或 Comment.id */
    id: string;
    /** 注释类型，对应 Comment.commentType */
    type: BookNoteType;
    /** CFI 位置标识，对应 Comment.positionInfo.cfi */
    cfi: string;
    /** 选中的文本，对应 Comment.selectedText */
    text?: string;
    /** 颜色字符串，对应 Comment.color */
    color?: string;
    /** 注释内容，对应 Comment.content */
    note: string;
    /** 创建时间，对应 Comment.createdAt */
    createdAt: number;
    /** 更新时间，对应 Comment.updatedAt */
    updatedAt: number;
    /** 删除时间，对应 Comment.deletedAt */
    deletedAt?: number | null;
}

/**
 * 笔记分组
 */
export interface BooknoteGroup {
    /** 分组 ID（目录项 ID） */
    id: number;
    /** 章节链接地址（href） */
    href: string;
    /** 分组标签（章节标题） */
    label: string;
    /** 该分组下的笔记列表 */
    booknotes: BookNote[];
}

/**
 * 搜索配置
 */
export interface BookSearchConfig {
    /** 搜索范围（全书或当前章节） */
    scope: 'book' | 'section';
    /** 是否区分大小写 */
    matchCase: boolean;
    /** 是否匹配完整单词（单词边界） */
    matchWholeWords: boolean;
    /** 是否匹配变音符号（如 é vs e） */
    matchDiacritics: boolean;
    /** 当前匹配索引（从 0 开始，可选） */
    index?: number;
    /** 搜索查询字符串（可选） */
    query?: string;
    /** 接受节点的回调函数（可选，用于过滤搜索结果） */
    acceptNode?: (node: Node) => number;
}

/**
 * 搜索摘要
 */
export interface SearchExcerpt {
    /** 匹配前的文本片段 */
    pre: string;
    /** 匹配的文本片段 */
    match: string;
    /** 匹配后的文本片段 */
    post: string;
}

/**
 * 搜索结果匹配项
 */
export interface BookSearchMatch {
    /** CFI 位置标识（用于跳转到匹配位置） */
    cfi: string;
    /** 搜索摘要（匹配文本的上下文） */
    excerpt: SearchExcerpt;
}

/**
 * 搜索结果
 */
export interface BookSearchResult {
    /** 结果标签（章节标题或分类） */
    label: string;
    /** 匹配项列表 */
    subitems: BookSearchMatch[];
    /** 进度百分比（0-100，可选，表示搜索进度） */
    progress?: number;
}

/**
 * 书籍配置
 * 存储书籍的阅读进度、笔记和设置
 */
export interface BookConfig {
    /** 书籍哈希值（可选，用于标识书籍版本） */
    bookHash?: string;
    /** 阅读进度：[当前页码, 总页数]，页码从 1 开始（可选） */
    progress?: [number, number];
    /** 当前位置的 CFI（Canonical Fragment Identifier，可选） */
    location?: string;
    /** 当前位置的 XPointer（可选） */
    xpointer?: string;
    /** 书籍笔记列表（可选） */
    booknotes?: BookNote[];
    /** 搜索配置（可选） */
    searchConfig?: Partial<BookSearchConfig>;
    /** 阅读器设置（可选，部分字段，覆盖全局设置） */
    readerSettings?: Partial<import('./settings').ReaderSettings>;
    /** 配置最后同步时间（Unix 时间戳，毫秒，可选） */
    lastSyncedAtConfig?: number;
    /** 笔记最后同步时间（Unix 时间戳，毫秒，可选） */
    lastSyncedAtNotes?: number;
    /** 更新时间（Unix 时间戳，毫秒） */
    updatedAt: number;
}

/**
 * 阅读进度（foliate-js 运行时格式）
 * 包含位置、章节、页面和时间信息
 */
export interface BookProgress {
    /** CFI 位置标识字符串（Canonical Fragment Identifier，用于精确定位） */
    location: string;
    /** 当前章节索引（从 0 开始） */
    sectionId: number;
    /** 当前章节的链接地址（href） */
    sectionHref: string;
    /** 当前章节的标签文本 */
    sectionLabel: string;
    /** 章节页面信息（当前章节内的页码信息） */
    section: PageInfo;
    /** 全书页面信息（全书的页码信息） */
    pageinfo: PageInfo;
    /** 时间信息（剩余阅读时间） */
    timeinfo: TimeInfo;
    /** 文本范围对象（可选，表示当前选中的文本范围） */
    range?: Range;
}

/**
 * foliate-view 元素类型
 */
export interface FoliateViewElement extends HTMLElement {
    /** 打开书籍文件 */
    open(file: string | File | FileSystemDirectoryHandle | BookDoc): Promise<void>;
    /** 关闭书籍 */
    close(): void;
    /** 跳转到指定位置 */
    goTo(
        target: string | number | { fraction: number }
    ): Promise<{ index: number; anchor: (doc: Document) => Range | Node } | undefined>;
    /** 跳转到指定比例位置 */
    goToFraction(fraction: number): Promise<void>;
    /** 向左翻页 */
    goLeft(): Promise<void>;
    /** 向右翻页 */
    goRight(): Promise<void>;
    /** 跳转到文本开始位置 */
    goToTextStart(): Promise<
        { index: number; anchor: (doc: Document) => Range | Node } | undefined
    >;
    /** 向前翻页 */
    prev(distance?: number): Promise<void>;
    /** 向后翻页 */
    next(distance?: number): Promise<void>;
    /** 选择指定位置 */
    select(target: string | number): Promise<void>;
    /** 取消选择 */
    deselect(): void;
    /** 搜索文本 */
    search(opts: {
        query: string;
        index?: number;
        matchCase?: boolean;
        matchWholeWords?: boolean;
        matchDiacritics?: boolean;
        acceptNode?: (node: Node) => number;
    }): AsyncGenerator<any>;
    /** 清除搜索 */
    clearSearch(): void;
    /** 添加标注 */
    addAnnotation(annotation: any, remove?: boolean): Promise<any>;
    /** 删除标注 */
    deleteAnnotation(annotation: any): Promise<any>;
    /** 显示标注 */
    showAnnotation(annotation: any): Promise<void>;
    /** 获取指定位置的 CFI */
    getCFI(index: number, range?: Range): string;
    /** 解析 CFI */
    resolveCFI(cfi: string): { index: number; anchor: (doc: Document) => Range | Node };
    /** 解析导航目标 */
    resolveNavigation(
        target: string | number | { fraction: number }
    ): { index: number; anchor: (doc: Document) => Range | Node } | undefined;
    /** 获取章节比例列表 */
    getSectionFractions(): number[];
    /** 获取指定位置的进度信息 */
    getProgressOf(
        index: number,
        range?: Range
    ): {
        tocItem?: TOCItem;
        pageItem?: { label: string };
    };
    /** 获取指定位置的目录项 */
    getTOCItemOf(target: string | number): Promise<TOCItem | undefined>;
    /** 初始化 TTS */
    initTTS(granularity?: string, highlight?: (range: Range) => void): Promise<void>;
    /** 启动媒体覆盖层 */
    startMediaOverlay(): void;
    /** 获取内容列表 */
    getContents(): Array<{
        index: number;
        doc: Document;
        overlayer?: unknown;
    }>;
    /** 初始化阅读器 */
    init(opts: { lastLocation?: string; showTextStart?: boolean }): Promise<void>;
    /** 书籍文档对象 */
    book: BookDoc;
    /** 历史记录对象（可选） */
    history?: {
        /** 是否可以后退 */
        canGoBack: boolean;
        /** 是否可以前进 */
        canGoForward: boolean;
        /** 后退 */
        back(): void;
        /** 前进 */
        forward(): void;
        /** 清空历史 */
        clear(): void;
    };
    /** 渲染器对象 */
    renderer: {
        /** 是否滚动模式（可选） */
        scrolled?: boolean;
        /** 当前页面高度（可选） */
        size?: number;
        /** 整个文档视图高度（可选） */
        viewSize?: number;
        /** 开始位置（可选） */
        start?: number;
        /** 结束位置（可选） */
        end?: number;
        /** 设置属性 */
        setAttribute(name: string, value: string): void;
        /** 获取属性（可选） */
        getAttribute?(name: string): string | null;
        /** 检查是否有属性（可选） */
        hasAttribute?(name: string): boolean;
        /** 移除属性（可选） */
        removeAttribute?(name: string): void;
        /** 设置样式（可选） */
        setStyles?(css: string): void;
        /** 下一页（可选） */
        next?(): void;
        /** 上一页（可选） */
        prev?(distance?: number): void;
        /** 下一章节（可选） */
        nextSection?(): Promise<void>;
        /** 上一章节（可选） */
        prevSection?(): Promise<void>;
        /** 跳转到指定位置（可选） */
        goTo?(target: {
            index: number;
            anchor: (doc: Document) => Range | Node;
            select?: boolean;
        }): Promise<void>;
        /** 滚动到锚点（可选） */
        scrollToAnchor?(range: Range, smooth?: boolean): void;
        /** 获取内容列表（可选） */
        getContents?(): Array<{
            index: number;
            doc: Document;
            overlayer?: unknown;
        }>;
        /** 销毁（可选） */
        destroy?(): void;
        /** 移除（可选） */
        remove?(): void;
        /** 添加事件监听器（可选） */
        addEventListener?(
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | AddEventListenerOptions
        ): void;
        /** 移除事件监听器（可选） */
        removeEventListener?(
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | EventListenerOptions
        ): void;
    };
    /** 是否为固定布局 */
    isFixedLayout: boolean;
    /** 最后位置 */
    lastLocation: any;
    /** 语言信息 */
    language: {
        /** 规范语言代码（可选） */
        canonical?: string;
        /** 语言区域对象（可选） */
        locale?: Intl.Locale;
        /** 是否为中日韩语言（可选） */
        isCJK?: boolean;
        /** 文本方向（可选） */
        direction?: 'ltr' | 'rtl';
    };
    /** TTS 对象（可选） */
    tts?: unknown;
    /** 媒体覆盖层事件对象（可选） */
    mediaOverlay?: EventTarget;
}

/**
 * 固定布局格式集合
 */
export const FIXED_LAYOUT_FORMATS: Set<BookFormat> = new Set(['pdf', 'cbz']);
