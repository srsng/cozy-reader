// 过时

/** 使用纯文本作为内容的书籍格式 */
export enum BookFormatTextType {
    /** 纯文本格式 */
    TXT = 'txt',
    /** Markdown格式 1 */
    MARKDOWN = 'markdown',
    /** Markdown格式 2 */
    MD = 'md',
    /** HTML格式 */
    HTML = 'html'
}

export enum BookFormatExtra {
    /** EPUB电子书格式 */
    EPUB = 'epub',
    /** PDF格式 */
    PDF = 'pdf'
}

/**
 * 书籍格式枚举
 */
export enum BookFormat {
    /** 纯文本格式 */
    TXT = 'txt',
    /** Markdown格式 1 */
    MARKDOWN = 'markdown',
    /** Markdown格式 2 */
    MD = 'md',
    /** HTML格式 */
    HTML = 'html',
    /** EPUB电子书格式 */
    EPUB = 'epub',
    /** PDF格式 */
    PDF = 'pdf'
}
/** 支持的书籍格式的字符串列表 */
export const BookFormatNames: BookFormat[] = Object.values(BookFormat);

export const BookFormatSupportFmt = `${BookFormat}`;

/** 使用纯文本作为内容的书籍格式 */
export const BookFormatTextTypes: BookFormatTextType[] = Object.values(BookFormatTextType);

/** 检查文件格式是否支持 */
export function isSupportFormat(filepath: string): boolean {
    const format = getFileFormat(filepath);
    return BookFormatNames.includes(format as any);
}

export function isTextBook(filepath: string): boolean {
    const format = getFileFormat(filepath);
    return BookFormatTextTypes.includes(format as BookFormatTextType);
}

/** 获取文件格式 */
export function getFileFormat(filepath: string): string {
    const format = filepath.split('.').pop()?.toLowerCase();
    return format || '';
}
