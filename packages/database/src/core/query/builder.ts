/**
 * 通用查询构建工具
 * 用于构建 SQL 查询的排序、分页等通用部分
 */

import { isValidFieldName, isValidColumnName } from '../validation/field';
import { DatabaseError } from '../errors';
import type { SortOrder } from '../types';

/**
 * 构建排序子句（带字段映射）
 * @param sortBy 排序字段（camelCase）
 * @param sortOrder 排序方向
 * @param fieldMap 字段名映射（camelCase -> snake_case）
 * @param defaultSortBy 默认排序字段（snake_case）
 * @returns SQL ORDER BY 子句（不包含 ORDER BY 关键字）
 */
export function buildSortClause(
    sortBy: string | undefined,
    sortOrder: SortOrder | undefined,
    fieldMap: Record<string, string>,
    defaultSortBy: string
): string {
    // 验证 defaultSortBy
    if (!isValidFieldName(defaultSortBy)) {
        throw new DatabaseError(
            `Invalid default sort field: ${defaultSortBy}`,
            'OPERATION_FAILED'
        );
    }

    // 确定排序字段
    let sortField: string;
    if (sortBy && fieldMap[sortBy]) {
        sortField = fieldMap[sortBy];
    } else {
        sortField = defaultSortBy;
    }

    // 验证最终使用的排序字段
    if (!isValidFieldName(sortField)) {
        throw new DatabaseError(
            `Invalid sort field: ${sortField}`,
            'OPERATION_FAILED'
        );
    }

    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
    return `${sortField} ${order}`;
}

/**
 * 构建分页子句
 * @param limit 分页限制
 * @param offset 分页偏移量
 * @returns SQL LIMIT/OFFSET 子句（包含 LIMIT 和可选的 OFFSET）和参数数组
 */
export function buildPaginationClause(limit?: number, offset?: number): { clause: string; params: number[] } {
    const clauses: string[] = [];
    const params: number[] = [];

    if (limit !== undefined && limit > 0) {
        clauses.push('LIMIT ?');
        params.push(limit);

        if (offset !== undefined && offset > 0) {
            clauses.push('OFFSET ?');
            params.push(offset);
        }
    }

    return {
        clause: clauses.join(' '),
        params
    };
}

/**
 * 构建搜索条件（LIKE 查询）
 * @param searchTerm 搜索关键词
 * @param fields 要搜索的字段列表（snake_case）
 * @param escapeFn 可选的转义函数（用于转义特殊字符）
 * @returns SQL 条件字符串和参数数组
 */
export function buildSearchCondition(
    searchTerm: string,
    fields: string[],
    escapeFn?: (str: string) => string
): { condition: string; params: string[] } {
    if (!searchTerm || fields.length === 0) {
        return { condition: '', params: [] };
    }

    const processedTerm = escapeFn ? escapeFn(searchTerm) : searchTerm;
    const searchPattern = `%${processedTerm}%`;
    const conditions = fields.map(field => `${field} LIKE ?`).join(' OR ');
    const params = fields.map(() => searchPattern);

    return {
        condition: `(${conditions})`,
        params
    };
}

/**
 * 构建标签筛选条件（使用 SQLite JSON1 扩展进行精确匹配）
 * @param tags 标签数组
 * @param tagColumn 标签列名（默认 'tags'）
 * @returns SQL 条件字符串和参数数组
 */
export function buildTagFilterCondition(
    tags: string[],
    tagColumn: string = 'tags'
): { condition: string; params: string[] } {
    if (!tags || tags.length === 0) {
        return { condition: '', params: [] };
    }

    // 验证列名，防止 SQL 注入
    if (!isValidColumnName(tagColumn)) {
        throw new DatabaseError(
            `Invalid tag column name: ${tagColumn}`,
            'OPERATION_FAILED'
        );
    }

    // 使用 JSON1 扩展的 json_each 函数进行精确匹配
    // 对于每个标签，检查它是否存在于 JSON 数组中
    const tagConditions = tags.map(() =>
        `EXISTS (SELECT 1 FROM json_each(${tagColumn}) WHERE json_each.value = ?)`
    ).join(' OR ');
    const params = tags;

    return {
        condition: `(${tagConditions})`,
        params
    };
}

/**
 * 构建软删除条件
 * @param deletedAtColumn 软删除列名（默认 'deleted_at'）
 * @param includeDeleted 是否包含已删除记录（默认 false）
 * @returns SQL 条件字符串
 */
export function buildSoftDeleteCondition(
    deletedAtColumn: string = 'deleted_at',
    includeDeleted: boolean = false
): string {
    if (includeDeleted) {
        return '1=1'; // 包含所有记录
    }
    return `${deletedAtColumn} IS NULL`;
}

/**
 * 转义 LIKE 查询中的特殊字符
 * 用于配合 buildSearchCondition 函数使用，防止 SQL 注入
 * @param query 要转义的查询字符串
 * @returns 转义后的字符串
 */
export function escapeLikeQuery(query: string): string {
    return query.replace(/[%_]/g, '\\$&');
}
