/**
 * Drizzle Schema 工具函数
 * 用于从 Drizzle schema 中提取默认值、列名等操作
 */

import type { SQL } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';


/**
 * 检查是否是 SQL 对象
 */
export function isSQLObject(value: any): value is SQL {
    return (
        typeof value === 'object' &&
        value !== null &&
        ('sql' in value || 'queryChunks' in value)
    );
}

/**
 * 从 Drizzle column 中提取默认值
 * 支持字面量默认值和函数默认值，SQL 表达式需要手动处理
 */
export function getDefaultValue<T>(column: {
    default?: T | SQL | undefined;
    defaultFn?: (() => T | SQL) | undefined;
}): T | null {
    // 优先检查 defaultFn（函数默认值）
    if (column.defaultFn) {
        const value = column.defaultFn();
        if (isSQLObject(value)) {
            return null; // SQL 表达式无法提取
        }
        return value as T;
    }

    // 检查 default（字面量或 SQL 表达式）
    if (column.default === undefined) {
        return null;
    }

    // 检查是否是 SQL 对象
    if (isSQLObject(column.default)) {
        return null; // SQL 表达式无法在运行时提取
    }

    return column.default as T;
}



/**
 * 列定义对象的类型守卫
 */
function isColumnDefinition(obj: unknown): obj is { name: string } {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        'name' in obj &&
        typeof (obj as { name: unknown }).name === 'string'
    );
}

/**
 * 从 Drizzle schema 表中提取所有列名（snake_case）
 * 
 * @param table Drizzle schema 表对象
 * @returns 所有列名的数组（snake_case）
 */
export function extractColumnNames<T extends SQLiteTable>(table: T): string[] {
    const columnNames: string[] = [];

    // 遍历表对象的所有属性
    for (const key in table) {
        // 跳过原型链上的属性
        if (!Object.prototype.hasOwnProperty.call(table, key)) {
            continue;
        }

        const column = table[key];

        // 检查是否是列定义对象（有 name 属性）
        if (isColumnDefinition(column)) {
            const columnName = column.name;
            if (columnName) {
                columnNames.push(columnName);
            }
        }
    }

    return columnNames;
}

/**
 * 生成 allowedUpdateFields，排除不允许更新的字段
 * 
 * @param table Drizzle schema 表对象
 * @param excludeFields 要排除的字段列表（默认：id, created_at, updated_at, deleted_at）
 * @returns 允许更新的字段名数组（snake_case）
 * 
 * @example
 * ```typescript
 * import { books } from '../../../drizzle/books/schema';
 * 
 * const allowedFields = generateAllowedUpdateFields(books, [
 *     'id',
 *     'path',
 *     'created_at',
 *     'updated_at',
 *     'deleted_at'
 * ]);
 * ```
 */
export function generateAllowedUpdateFields<T extends SQLiteTable>(
    table: T,
    excludeFields: string[] = ['id', 'created_at', 'updated_at', 'deleted_at']
): string[] {
    const allColumns = extractColumnNames(table);
    return allColumns.filter(col => !excludeFields.includes(col));
}
