/**
 * Zod 运行时验证工具
 * 提供数据库记录的运行时类型验证
 */

import { z } from 'zod';
import { DatabaseError } from '../errors';

/**
 * 验证数据库记录是否符合指定的 Zod Schema
 * @param record 要验证的记录
 * @param schema Zod Schema
 * @returns 验证后的记录
 * @throws DatabaseError 如果验证失败
 */
export function validateRecord<T>(
    record: unknown,
    schema: z.ZodType<T>
): T {
    try {
        return schema.parse(record);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.issues.map((issue) => {
                const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
                return `${path}: ${issue.message}`;
            }).join('; ');
            throw new DatabaseError(
                `Record validation failed: ${errors}`,
                'OPERATION_FAILED',
                error
            );
        }
        throw new DatabaseError(
            `Record validation failed: ${error instanceof Error ? error.message : String(error)}`,
            'OPERATION_FAILED',
            error
        );
    }
}

/**
 * 安全地验证数据库记录，如果验证失败返回默认值
 * @param record 要验证的记录
 * @param schema Zod Schema
 * @param defaultValue 验证失败时的默认值
 * @returns 验证后的记录或默认值
 */
export function safeValidateRecord<T>(
    record: unknown,
    schema: z.ZodType<T>,
    defaultValue: T
): T {
    try {
        return schema.parse(record);
    } catch {
        return defaultValue;
    }
}

/**
 * 检查记录是否符合指定的 Zod Schema（不抛出异常）
 * @param record 要检查的记录
 * @param schema Zod Schema
 * @returns 是否符合schema
 */
export function isValidRecord<T>(
    record: unknown,
    schema: z.ZodType<T>
): record is T {
    return schema.safeParse(record).success;
}

