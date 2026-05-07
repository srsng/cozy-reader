/**
 * JSON 工具函数
 * 提供通用的 JSON 验证和解析功能
 */

/**
 * 验证 JSON 字符串是否有效
 * @param jsonString JSON 字符串
 * @returns 是否有效
 */
export function isValidJSON(jsonString: string | null | undefined): boolean {
    if (!jsonString) {
        return false;
    }
    try {
        JSON.parse(jsonString);
        return true;
    } catch {
        return false;
    }
}

/**
 * 安全解析 JSON 字符串
 * @param jsonString JSON 字符串
 * @param defaultValue 默认值
 * @returns 解析后的对象或默认值
 */
export function safeParseJSON<T>(jsonString: string | null | undefined, defaultValue: T): T {
    if (!jsonString) {
        return defaultValue;
    }
    try {
        return JSON.parse(jsonString) as T;
    } catch {
        return defaultValue;
    }
}
