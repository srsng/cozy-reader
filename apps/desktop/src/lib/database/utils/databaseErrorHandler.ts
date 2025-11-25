import { type DatabaseResult, DatabaseError } from '../types';
import type { DB_NAME } from '../const';

/**
 * 数据库错误处理工具类
 * 提供统一的错误处理和验证功能
 */
export class DatabaseErrorHandler {
    /**
     * 安全执行数据库操作的包装函数
     * @param operation 数据库操作函数
     * @param errorMessage 错误消息
     * @param databaseName 数据库名称（可选）
     * @returns 数据库操作结果
     */
    static async safeExecute<T>(
        operation: () => Promise<T>,
        errorMessage: string = 'Database operation failed',
        databaseName?: DB_NAME
    ): Promise<DatabaseResult<T>> {
        try {
            const result = await operation();
            return { success: true, data: result };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            const dbError = new DatabaseError(
                errorMsg || errorMessage,
                databaseName,
                undefined,
                error instanceof Error ? error : new Error(String(error))
            );
            console.error(dbError.message, error);
            return { success: false, error: dbError.message };
        }
    }

    /**
     * 验证必需字段
     * @param data 数据对象
     * @param requiredFields 必需字段数组
     * @throws 如果缺少必需字段则抛出错误
     */
    static validateRequiredFields(data: Record<string, any>, requiredFields: string[]): void {
        const missingFields = requiredFields.filter(
            (field) => data[field] === undefined || data[field] === null || data[field] === ''
        );

        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
    }
}

