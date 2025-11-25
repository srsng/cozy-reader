/**
 * SQL 构建工具函数
 * 提供 SQL 查询构建相关的工具函数
 */

/**
 * 构建 WHERE 条件和参数
 * @param conditions 条件对象
 * @param operators 操作符映射（可选）
 * @returns WHERE 子句和参数数组
 */
export function buildWhereClause(
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
 * @param sortBy 排序字段
 * @param sortOrder 排序方向
 * @returns ORDER BY 子句
 */
export function buildOrderClause(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): string {
    if (!sortBy) return '';
    return `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
}

/**
 * 构建 LIMIT 和 OFFSET 子句
 * @param limit 限制数量
 * @param offset 偏移量
 * @returns LIMIT/OFFSET 子句和参数数组
 */
export function buildLimitClause(limit?: number, offset?: number): { clause: string; params: any[] } {
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
 * 转义 SQL LIKE 查询中的特殊字符
 * @param query 查询字符串
 * @returns 转义后的字符串
 */
export function escapeLikeQuery(query: string): string {
    return query.replace(/[%_]/g, '\\$&');
}

