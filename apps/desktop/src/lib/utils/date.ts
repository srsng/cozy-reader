import { getLocaleFromLangCode } from './locale';
import type { AppLanguageCode } from '$lib/settings/Base';

/**
 * 日期格式化工具函数
 * 提供通用的日期格式化功能
 */

/**
 * 格式化时间戳为可读字符串
 * @param timestamp Unix 时间戳（秒）
 * @param locale 语言环境，默认 'zh-CN'
 * @returns 格式化的日期字符串
 */
export function formatTimestamp(
    timestamp: number | null | undefined,
    locale: string = 'zh-CN'
): string {
    if (timestamp === null || timestamp === undefined) {
        return '';
    }
    return new Date(timestamp * 1000).toLocaleString(locale);
}

/**
 * 格式化日期为本地化日期字符串
 * 支持 Unix 时间戳（秒）和日期字符串
 * @param dateInput Unix 时间戳（秒）或日期字符串
 * @param locale BCP 47 locale 字符串，如 'zh-CN' 或 'en'
 * @returns 格式化的日期字符串，如果输入无效则返回空字符串
 */
export function formatDate(
    dateInput: number | string | null | undefined,
    locale: string = 'zh-CN'
): string {
    if (dateInput === null || dateInput === undefined) {
        return '';
    }
    // 如果是数字，将其作为 Unix 时间戳（秒）转换为 Date
    if (typeof dateInput === 'number') {
        return new Date(dateInput * 1000).toLocaleDateString(locale);
    }
    // 如果是字符串，保持原有逻辑
    return new Date(dateInput).toLocaleDateString(locale);
}

/**
 * 使用应用语言代码格式化日期
 * @param dateInput Unix 时间戳（秒）或日期字符串
 * @param langCode 应用语言代码 ('zh-cn' | 'en')
 * @returns 格式化的日期字符串
 */
export function formatDateWithLangCode(
    dateInput: number | string | null | undefined,
    langCode: AppLanguageCode | string
): string {
    const locale = getLocaleFromLangCode(langCode);
    return formatDate(dateInput, locale);
}
