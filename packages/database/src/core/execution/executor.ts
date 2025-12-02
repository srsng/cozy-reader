/**
 * 统一数据库操作包装器
 * 提供错误处理和可选的性能监控
 */

import Database from '@tauri-apps/plugin-sql';
import { DatabaseError } from '../errors';
import type { DatabaseName } from '../types';
import { PerformanceMonitor } from './performance';

export interface ExecuteOptions {
    /** 是否启用性能监控 */
    enableMonitoring?: boolean;
    /** 操作名称（用于性能监控） */
    operationName?: string;
}

/**
 * 统一执行数据库查询（SELECT）
 */
export async function executeSelect<T>(
    db: Database,
    dbName: DatabaseName,
    sql: string,
    params?: readonly unknown[],
    options?: ExecuteOptions
): Promise<T> {
    const shouldMonitor = options?.enableMonitoring && options?.operationName;
    const startTime = shouldMonitor ? performance.now() : undefined;

    try {
        const result = await db.select<T>(sql, params ? [...params] : undefined);

        if (shouldMonitor && startTime !== undefined) {
            const monitor = PerformanceMonitor.getInstance();
            monitor.record(
                options!.operationName!,
                performance.now() - startTime
            );
        }

        return result;
    } catch (error) {
        if (shouldMonitor && startTime !== undefined) {
            const monitor = PerformanceMonitor.getInstance();
            monitor.record(
                options!.operationName!,
                performance.now() - startTime
            );
        }

        throw new DatabaseError(
            `Database query failed: ${error instanceof Error ? error.message : String(error)}`,
            'QUERY_FAILED',
            error
        );
    }
}

/**
 * 统一执行数据库操作（INSERT/UPDATE/DELETE）
 */
export async function executeUpdate(
    db: Database,
    dbName: DatabaseName,
    sql: string,
    params?: readonly unknown[],
    options?: ExecuteOptions
): Promise<{ lastInsertId: number; rowsAffected: number }> {
    const shouldMonitor = options?.enableMonitoring && options?.operationName;
    const startTime = shouldMonitor ? performance.now() : undefined;

    try {
        const result = await db.execute(sql, params ? [...params] : undefined);

        if (shouldMonitor) {
            const monitor = PerformanceMonitor.getInstance();
            monitor.record(
                options!.operationName!,
                performance.now() - startTime!
            );
        }

        // lastInsertId 可能是 number 或 bigint，确保转换为 number
        const lastInsertId = typeof result.lastInsertId === 'bigint'
            ? Number(result.lastInsertId)
            : (result.lastInsertId ?? 0);

        return {
            lastInsertId,
            rowsAffected: result.rowsAffected ?? 0
        };
    } catch (error) {
        if (shouldMonitor) {
            const monitor = PerformanceMonitor.getInstance();
            monitor.record(
                options!.operationName!,
                performance.now() - startTime!
            );
        }

        throw new DatabaseError(
            `Database operation failed: ${error instanceof Error ? error.message : String(error)}`,
            'OPERATION_FAILED',
            error
        );
    }
}

