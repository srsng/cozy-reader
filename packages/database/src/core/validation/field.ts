/**
 * 字段名验证工具
 * 用于防止 SQL 注入攻击，确保只有允许的字段名被用于 SQL 查询
 */

import { DatabaseError } from '../errors';

/**
 * 验证字段名是否安全
 * 只允许字母、数字、下划线和点号，且必须以字母或下划线开头
 * 
 * @param fieldName 要验证的字段名
 * @returns 是否为安全的字段名
 */
export function isValidFieldName(fieldName: string): boolean {
    // 字段名必须匹配：字母/下划线开头，后跟字母/数字/下划线/点号
    // 不允许 SQL 关键字、特殊字符等
    const fieldNamePattern = /^[a-zA-Z_][a-zA-Z0-9_.]*$/;

    if (!fieldNamePattern.test(fieldName)) {
        return false;
    }

    // 不允许连续的点号
    if (fieldName.includes('..')) {
        return false;
    }

    // 不允许以点号结尾
    if (fieldName.endsWith('.')) {
        return false;
    }

    return true;
}

/**
 * 验证字段名是否在白名单中
 * 
 * @param fieldName 要验证的字段名
 * @param allowedFields 允许的字段名白名单
 * @returns 是否在白名单中
 */
export function isFieldAllowed(fieldName: string, allowedFields: string[]): boolean {
    if (!isValidFieldName(fieldName)) {
        return false;
    }

    return allowedFields.includes(fieldName);
}

/**
 * 验证表名是否安全
 * 表名使用与字段名相同的验证规则
 * 
 * @param tableName 要验证的表名
 * @returns 是否为安全的表名
 */
export function isValidTableName(tableName: string): boolean {
    return isValidFieldName(tableName);
}

/**
 * 验证列名是否安全
 * 列名使用与字段名相同的验证规则
 * 
 * @param columnName 要验证的列名
 * @returns 是否为安全的列名
 */
export function isValidColumnName(columnName: string): boolean {
    return isValidFieldName(columnName);
}

/**
 * 从更新语句字符串中提取字段名
 * 例如："title = ?" -> "title"
 * 
 * @param updateClause 更新子句，格式为 "`field_name` = ?"
 * @returns 字段名，如果格式不正确返回 null
 */
export function extractFieldNameFromUpdateClause(updateClause: string): string | null {
    // 匹配格式：字段名 = ?
    const match = updateClause.match(/^\s*([a-zA-Z_][a-zA-Z0-9_.]*)\s*=\s*\?\s*$/);
    if (!match) {
        return null;
    }
    return match[1];
}

/**
 * 验证更新子句数组中的所有字段名
 * 
 * @param updateClauses 更新子句数组，格式为 ["`field_name` = ?", ...]
 * @param allowedFields 允许的字段名白名单
 * @throws DatabaseError 如果发现不允许的字段名
 */
export function validateUpdateClauses(
    updateClauses: string[],
    allowedFields: string[]
): void {
    for (const clause of updateClauses) {
        const fieldName = extractFieldNameFromUpdateClause(clause);
        if (!fieldName) {
            throw new DatabaseError(
                `Invalid update clause format: ${clause}`,
                'OPERATION_FAILED'
            );
        }

        if (!isFieldAllowed(fieldName, allowedFields)) {
            throw new DatabaseError(
                `Field "${fieldName}" is not allowed. Allowed fields: ${allowedFields.join(', ')}`,
                'OPERATION_FAILED'
            );
        }
    }
}

