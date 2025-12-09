/**
 * 支持的书籍格式列表
 */
export const SUPPORTED_BOOK_FORMATS = [
    'txt',
    'markdown',
    'md',
    'html',
    'epub',
    'pdf',
    'mobi',
    'azw',
    'azw3',
    'cbz',
    'fb2',
    'fbz'
] as const;

export type BookFormat = typeof SUPPORTED_BOOK_FORMATS[number];

/**
 * 类型守卫：检查字符串是否为有效的 BookFormat
 * @param format 要检查的字符串
 * @returns 是否为 BookFormat 类型
 */
function isBookFormat(format: string): format is BookFormat {
    // 使用类型安全的检查方式
    for (const supportedFormat of SUPPORTED_BOOK_FORMATS) {
        if (format === supportedFormat) {
            return true;
        }
    }
    return false;
}

/**
 * 检查文件格式是否支持
 * @param filepath 文件路径
 * @returns 是否支持
 */
export function isSupportFormat(filepath: string): boolean {
    const format = getFileFormat(filepath);
    return isBookFormat(format);
}

// export function isTextBook(filepath: string): boolean {
// todo: 后端实现
// }

/**
 * 获取文件格式（小写）
 * @deprecated 此函数仅通过扩展名判断，不可靠。请使用后端 `get_file_info` API 获取准确的文件格式信息。
 * @param filepath 文件路径
 * @returns 文件格式（小写），如果无法获取则返回空字符串
 */
export function getFileFormat(filepath: string): BookFormat | string {
    const format = filepath.split('.').pop()?.toLowerCase();
    return format || '';
}

/**
 * 从文件路径提取标题（移除扩展名）
 * @param filepath 文件路径
 * @returns 标题
 */
export function extractTitleFromPath(filepath: string): string {
    const fileName = filepath.split(/[\\/]/).pop() || 'Unknown';
    const parts = fileName.split('.');
    // 移除最后一个部分（扩展名）
    parts.pop();
    return parts.join('.') || fileName; // 如果没有扩展名，返回原文件名
}

