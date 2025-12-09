/**
 * 语言相关工具函数
 */

/**
 * 判断字符串是否包含 CJK（中日韩）字符
 * @param str 要检查的字符串
 * @returns 是否包含 CJK 字符
 */
export function isCJKStr(str: string): boolean {
    return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(str ?? '');
}

/**
 * 判断语言代码是否为 CJK 语言
 * @param lang 语言代码
 * @returns 是否为 CJK 语言
 */
export function isCJKLang(lang: string | null | undefined): boolean {
    if (!lang) return false;
    const normalizedLang = normalizedLangCode(lang);
    return ['zh', 'ja', 'ko', 'zho', 'jpn', 'kor'].includes(normalizedLang);
}

/**
 * 规范化语言代码（提取主要部分）
 * @param lang 语言代码
 * @returns 规范化后的语言代码
 */
export function normalizedLangCode(lang: string | null | undefined): string {
    if (!lang) return '';
    return lang.split('-')[0]!.toLowerCase();
}

