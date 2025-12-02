/**
 * 类型守卫函数
 * 提供类型守卫函数，减少类型断言的使用
 */

import type { DatabaseErrorCode, DatabaseResult } from './index';

/**
 * 类型守卫：检查值是否为指定类型
 * @param value 要检查的值
 * @param validator 类型验证函数
 * @returns 是否为指定类型
 */
export function isType<T>(value: unknown, validator: (v: unknown) => v is T): value is T {
    return validator(value);
}

/**
 * DatabaseResult 成功结果类型守卫
 * @param result 数据库操作结果
 * @returns 是否为成功结果
 */
export function isSuccessResult<T>(
    result: DatabaseResult<T>
): result is { success: true; data: T } {
    return result.success === true;
}

/**
 * DatabaseResult 失败结果类型守卫
 * @param result 数据库操作结果
 * @returns 是否为失败结果
 */
export function isErrorResult<T>(
    result: DatabaseResult<T>
): result is {
    success: false;
    data?: T;
    error: string;
    code?: DatabaseErrorCode;
    cause?: unknown;
} {
    return result.success === false;
}

/**
 * 检查值是否为 Record<string, unknown> 类型
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 检查值是否为数组类型
 */
export function isArray<T>(value: unknown, itemValidator?: (item: unknown) => item is T): value is T[] {
    if (!Array.isArray(value)) {
        return false;
    }
    if (itemValidator) {
        return value.every(itemValidator);
    }
    return true;
}

