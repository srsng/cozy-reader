import type { DatabaseResult } from './types';

/**
 * 数据库工具类
 */
export class DatabaseUtils {
    /**
     * 安全执行数据库操作的包装函数
     */
    static async safeExecute<T>(
        operation: () => Promise<T>,
        errorMessage: string = 'Database operation failed'
    ): Promise<DatabaseResult<T>> {
        try {
            const result = await operation();
            return { success: true, data: result };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`${errorMessage}:`, error);
            return { success: false, error: `${errorMessage}: ${errorMsg}` };
        }
    }

    /**
     * 构建 WHERE 条件和参数
     */
    static buildWhereClause(
        conditions: Record<string, any>,
        operators: Record<string, string> = {}
    ): { whereClause: string; params: any[] } {
        const whereParts: string[] = [];
        const params: any[] = [];

        for (const [key, value] of Object.entries(conditions)) {
            if (value !== undefined && value !== null) {
                const operator = operators[key] || '=';
                whereParts.push(`${key} ${operator} ?`);
                params.push(value);
            }
        }

        const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';
        return { whereClause, params };
    }

    /**
     * 构建 ORDER BY 子句
     */
    static buildOrderClause(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): string {
        if (!sortBy) return '';
        return `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    }

    /**
     * 构建 LIMIT 和 OFFSET 子句
     */
    static buildLimitClause(limit?: number, offset?: number): { clause: string; params: any[] } {
        const params: any[] = [];
        let clause = '';

        if (limit) {
            clause += ' LIMIT ?';
            params.push(limit);

            if (offset) {
                clause += ' OFFSET ?';
                params.push(offset);
            }
        }

        return { clause, params };
    }

    /**
     * 验证必需字段
     */
    static validateRequiredFields(data: Record<string, any>, requiredFields: string[]): void {
        const missingFields = requiredFields.filter(
            (field) => data[field] === undefined || data[field] === null || data[field] === ''
        );

        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
    }

    /**
     * 转义 SQL LIKE 查询中的特殊字符
     */
    static escapeLikeQuery(query: string): string {
        return query.replace(/[%_]/g, '\\$&');
    }
}
