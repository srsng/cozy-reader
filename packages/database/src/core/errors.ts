/**
 * 数据库错误处理模块
 */

import type { DatabaseName, DatabaseErrorCode, DatabaseResult } from '.';

/**
 * 数据库错误类
 */
export class DatabaseError extends Error {
    constructor(
        message: string,
        public readonly code?: DatabaseErrorCode,
        public readonly cause?: unknown
    ) {
        super(message);
        this.name = 'DatabaseError';
    }
}

/**
 * 通用错误处理辅助函数
 * @param error 捕获的错误
 * @param databaseName 数据库名称
 * @returns DatabaseResult<never>
 */
export function handleError(error: unknown, databaseName: DatabaseName): DatabaseResult<never> {
    // 统一将非Error对象转换为Error对象，保留堆栈信息
    const normalizedError = error instanceof Error
        ? error
        : new Error(String(error));

    if (error instanceof DatabaseError) {
        return {
            success: false,
            error: `[${databaseName}] ${error.message}`,
            code: error.code,
            cause: normalizedError
        };
    } else {
        return {
            success: false,
            error: `[${databaseName}] ${normalizedError.message}`,
            code: 'UNKNOWN_ERROR',
            cause: normalizedError
        };
    }
}

