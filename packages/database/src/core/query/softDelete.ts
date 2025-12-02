/**
 * 软删除工具函数
 * 注意：软删除条件构建函数 buildSoftDeleteCondition 在 builder.ts
 */

import Database from '@tauri-apps/plugin-sql';
import { DatabaseError } from '../errors';
import type { DatabaseName } from '../types';
import { executeUpdate, executeSelect, type ExecuteOptions } from '../execution';
import { isValidTableName, isValidColumnName } from '../validation/field';

/**
 * 软删除记录
 * 
 * 并发安全保证：
 * - SQLite 默认使用 SERIALIZABLE 隔离级别，提供强一致性保证
 * - WHERE 条件中的 `AND ${deletedAtColumn} IS NULL` 确保幂等性
 * - 如果记录已被删除，rowsAffected 为 0，会抛出 RECORD_NOT_FOUND 错误
 * 
 * 注意：对于需要多个操作原子性的场景（如更新书籍+创建会话），
 * 应使用事务包装（参考 Transaction 类）
 */
export async function softDelete(
    db: Database,
    dbName: DatabaseName,
    table: string,
    id: number,
    deletedAtColumn: string = 'deleted_at',
    options?: ExecuteOptions
): Promise<void> {
    // 验证表名和列名
    if (!isValidTableName(table)) {
        throw new DatabaseError(`Invalid table name: ${table}`, 'OPERATION_FAILED');
    }
    if (!isValidColumnName(deletedAtColumn)) {
        throw new DatabaseError(`Invalid column name: ${deletedAtColumn}`, 'OPERATION_FAILED');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const result = await executeUpdate(
        db,
        dbName,
        `UPDATE ${table} SET ${deletedAtColumn} = ? WHERE id = ? AND ${deletedAtColumn} IS NULL`,
        [timestamp, id],
        { ...options, operationName: `softDelete:${table}` }
    );

    if (result.rowsAffected === 0) {
        throw new DatabaseError(
            `Record with id ${id} not found or already deleted in table ${table}`,
            'RECORD_NOT_FOUND'
        );
    }
}

/**
 * 硬删除记录（物理删除）
 * 
 * 并发安全保证：
 * - SQLite 默认使用 SERIALIZABLE 隔离级别
 * - 如果记录不存在，rowsAffected 为 0，会抛出 RECORD_NOT_FOUND 错误
 * 
 * 注意：硬删除操作不可逆，请谨慎使用
 */
export async function hardDelete(
    db: Database,
    dbName: DatabaseName,
    table: string,
    id: number,
    options?: ExecuteOptions
): Promise<void> {
    // 验证表名
    if (!isValidTableName(table)) {
        throw new DatabaseError(`Invalid table name: ${table}`, 'OPERATION_FAILED');
    }

    const result = await executeUpdate(
        db,
        dbName,
        `DELETE FROM ${table} WHERE id = ?`,
        [id],
        { ...options, operationName: `hardDelete:${table}` }
    );

    if (result.rowsAffected === 0) {
        throw new DatabaseError(
            `Record with id ${id} not found in table ${table}`,
            'RECORD_NOT_FOUND'
        );
    }
}

/**
 * 恢复已删除的记录
 * 
 * 并发安全保证：
 * - SQLite 默认使用 SERIALIZABLE 隔离级别
 * - WHERE 条件中的 `AND ${deletedAtColumn} IS NOT NULL` 确保只恢复已删除的记录
 * - 如果记录未删除或不存在，rowsAffected 为 0，会抛出 RECORD_NOT_FOUND 错误
 */
export async function restoreDeleted(
    db: Database,
    dbName: DatabaseName,
    table: string,
    id: number,
    deletedAtColumn: string = 'deleted_at',
    options?: ExecuteOptions
): Promise<void> {
    // 验证表名和列名
    if (!isValidTableName(table)) {
        throw new DatabaseError(`Invalid table name: ${table}`, 'OPERATION_FAILED');
    }
    if (!isValidColumnName(deletedAtColumn)) {
        throw new DatabaseError(`Invalid column name: ${deletedAtColumn}`, 'OPERATION_FAILED');
    }

    const result = await executeUpdate(
        db,
        dbName,
        `UPDATE ${table} SET ${deletedAtColumn} = NULL WHERE id = ? AND ${deletedAtColumn} IS NOT NULL`,
        [id],
        { ...options, operationName: `restore:${table}` }
    );

    if (result.rowsAffected === 0) {
        throw new DatabaseError(
            `Record with id ${id} not found or not deleted in table ${table}`,
            'RECORD_NOT_FOUND'
        );
    }
}

/**
 * 检查记录是否已软删除
 * 
 * @param db 数据库连接
 * @param dbName 数据库名称
 * @param table 表名
 * @param id 记录 ID
 * @param deletedAtColumn 软删除列名（默认 'deleted_at'）
 * @param options 可选配置
 * @returns 如果记录已软删除返回 true，未删除返回 false
 * @throws DatabaseError 如果记录不存在或发生其他错误
 */
export async function isDeleted(
    db: Database,
    dbName: DatabaseName,
    table: string,
    id: number,
    deletedAtColumn: string = 'deleted_at',
    options?: ExecuteOptions
): Promise<boolean> {
    // 验证表名和列名
    if (!isValidTableName(table)) {
        throw new DatabaseError(`Invalid table name: ${table}`, 'OPERATION_FAILED');
    }
    if (!isValidColumnName(deletedAtColumn)) {
        throw new DatabaseError(`Invalid column name: ${deletedAtColumn}`, 'OPERATION_FAILED');
    }

    const result = await executeSelect<{ deleted_at: number | null }[]>(
        db,
        dbName,
        `SELECT ${deletedAtColumn} as deleted_at FROM ${table} WHERE id = ?`,
        [id],
        {
            operationName: `isDeleted:${table}`,
            ...options
        }
    );

    if (result.length === 0) {
        throw new DatabaseError(
            `Record with id ${id} not found in table ${table}`,
            'RECORD_NOT_FOUND'
        );
    }

    return result[0].deleted_at !== null && result[0].deleted_at !== 0;
}

