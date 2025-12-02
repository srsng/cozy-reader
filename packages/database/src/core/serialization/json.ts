/**
 * JSON 工具函数
 */

import { z } from 'zod';
import { safeValidateRecord } from '../validation';

/**
 * 验证字符串是否为有效的 JSON
 * 
 * @param str 要验证的字符串
 * @returns 是否为有效的 JSON
 * 
 * 虽然规范中NULL是有效的JSON (`JSON.parse(null)===null`), 但这里不认为NULL是有效的JSON。
 */
export function isValidJSON(str: string): boolean {
    if (typeof str !== 'string') {
        return false;
    }
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

/**
 * 序列化对象为 JSON 字符串（用于数据库存储）
 * @param value 要序列化的值
 * @returns JSON 字符串，如果值为 null 或 undefined 则返回 null
 */
export function serializeJSON(value: unknown): string | null {
    if (value === null || value === undefined) {
        return null;
    }
    try {
        return JSON.stringify(value);
    } catch (error) {
        throw new Error(`Failed to serialize JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * 反序列化 JSON 字符串为对象（用于从数据库读取）
 * @param jsonString JSON 字符串
 * @param defaultValue 如果解析失败或为 null 时的默认值
 * @param schema 可选的 Zod schema，用于运行时类型验证
 * @returns 解析后的对象，如果解析失败或验证失败则返回默认值
 */
export function deserializeJSON<T>(
    jsonString: string | null | undefined,
    defaultValue: T,
    schema?: z.ZodType<T>
): T {
    if (jsonString === null || jsonString === undefined || jsonString === '') {
        return defaultValue;
    }
    try {
        const parsed = JSON.parse(jsonString);

        // 如果提供了schema，使用Zod进行验证
        if (schema) {
            return safeValidateRecord(parsed, schema, defaultValue);
        }

        // 没有schema时，直接返回解析结果（依赖TypeScript类型系统）
        return parsed as T;
    } catch {
        return defaultValue;
    }
}

