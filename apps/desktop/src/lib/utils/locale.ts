import type { AppLanguageCode } from '$lib/settings/Base';

/**
 * 语言代码工具函数
 * 用于处理应用语言代码到 BCP 47 locale 的转换
 */

/**
 * 应用语言代码到 BCP 47 locale 的映射表
 */
const LANG_CODE_TO_LOCALE_MAP: Record<AppLanguageCode, string> = {
    'zh-cn': 'zh-CN',
    en: 'en'
};

/**
 * 将应用语言代码转换为 toLocaleDateString 需要的 locale 格式
 * @param langCode 应用语言代码，如 'zh-cn', 'en' 等
 * @returns BCP 47 locale 字符串，如 'zh-CN', 'en' 等
 */
export function getLocaleFromLangCode(langCode: AppLanguageCode | string): string {
    if (langCode in LANG_CODE_TO_LOCALE_MAP) {
        return LANG_CODE_TO_LOCALE_MAP[langCode as AppLanguageCode];
    }

    // 对于未映射的语言代码，尝试智能转换
    // 将连字符分隔的语言代码转换为标准格式（地区代码大写）
    const parts = langCode.toLowerCase().split('-');
    if (parts.length === 2) {
        // 格式：language-REGION -> language-REGION（地区代码大写）
        return `${parts[0]}-${parts[1].toUpperCase()}`;
    }

    // 单语言代码直接返回
    return langCode.toLowerCase();
}

