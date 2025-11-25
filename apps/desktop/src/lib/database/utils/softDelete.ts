import type { DB_NAME } from '../const';
import { DatabaseManager } from '../manager';

/**
 * 软删除工具函数
 */

/**
 * 软删除记录
 * @param databaseName 数据库名称
 * @param tableName 表名
 * @param id 记录 ID
 * @returns 是否成功
 */
export async function softDelete(
    databaseName: DB_NAME,
    tableName: string,
    id: number
): Promise<boolean> {
    const manager = DatabaseManager.getInstance();
    const db = await manager.getDatabase(databaseName);

    const result = await db.execute(
        `UPDATE ${tableName} SET deleted_at = strftime('%s', 'now') WHERE id = ? AND deleted_at IS NULL`,
        [id]
    );

    return (result.rowsAffected ?? 0) > 0;
}

/**
 * 硬删除记录（真正删除）
 * @param databaseName 数据库名称
 * @param tableName 表名
 * @param id 记录 ID
 * @returns 是否成功
 */
export async function hardDelete(
    databaseName: DB_NAME,
    tableName: string,
    id: number
): Promise<boolean> {
    const manager = DatabaseManager.getInstance();
    const db = await manager.getDatabase(databaseName);

    const result = await db.execute(
        `DELETE FROM ${tableName} WHERE id = ?`,
        [id]
    );

    return (result.rowsAffected ?? 0) > 0;
}

/**
 * 恢复软删除的记录
 * @param databaseName 数据库名称
 * @param tableName 表名
 * @param id 记录 ID
 * @returns 是否成功
 */
export async function restoreDeleted(
    databaseName: DB_NAME,
    tableName: string,
    id: number
): Promise<boolean> {
    const manager = DatabaseManager.getInstance();
    const db = await manager.getDatabase(databaseName);

    const result = await db.execute(
        `UPDATE ${tableName} SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL`,
        [id]
    );

    return (result.rowsAffected ?? 0) > 0;
}

/**
 * 构建软删除过滤条件
 * @param includeDeleted 是否包含已删除的记录
 * @returns SQL 条件字符串，如果包含已删除记录则返回 '1=1'（始终为真），否则返回 'deleted_at IS NULL'
 */
export function buildSoftDeleteCondition(includeDeleted: boolean = false): string {
    if (includeDeleted) {
        return '1=1'; // 返回始终为真的条件，避免 WHERE 子句为空
    }
    return 'deleted_at IS NULL';
}

