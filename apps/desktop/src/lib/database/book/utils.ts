import { getDatabase, closeDatabase } from './config';
import { BookService } from './bookService';
import { ReadingSessionService } from './readingSessionService';
import type { DatabaseResult } from '../types';
import { DatabaseUtils as BaseUtils } from '../utils';
import { BookFormat, getFileFormat, isSupportFormat, StorageType, type Book } from './book';

/**
 * 通用操作结果类型（向后兼容）
 */
export interface Result<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * 数据库工具类
 */
export class DatabaseUtils extends BaseUtils {
    /**
     * 安全执行数据库操作的包装函数（向后兼容）
     */
    static async safeExecute<T>(
        operation: () => Promise<T>,
        errorMessage: string = 'Database operation failed'
    ): Promise<DatabaseResult<T>> {
        return await super.safeExecute(operation, errorMessage);
    }

    /**
     * 检查数据库连接
     */
    static async checkConnection(): Promise<boolean> {
        try {
            const db = await getDatabase();
            await db.execute('SELECT 1');
            return true;
        } catch (error) {
            console.error('Database connection check failed:', error);
            return false;
        }
    }

    /**
     * 备份数据库
     */
    static async backupDatabase(backupPath: string): Promise<DatabaseResult<void>> {
        return await this.safeExecute(async () => {
            const db = await getDatabase();
            await db.execute(`VACUUM INTO '${backupPath}'`);
        }, 'Failed to backup database');
    }

    /**
     * 获取数据库大小信息
     */
    static async getDatabaseSize(): Promise<
        DatabaseResult<{
            page_count: number;
            page_size: number;
            total_size: number;
        }>
    > {
        return await this.safeExecute(async () => {
            const db = await getDatabase();

            const pageCountResult = await db.select<{ page_count: number }[]>('PRAGMA page_count');
            const pageSizeResult = await db.select<{ page_size: number }[]>('PRAGMA page_size');

            const pageCount = pageCountResult[0].page_count;
            const pageSize = pageSizeResult[0].page_size;

            return {
                page_count: pageCount,
                page_size: pageSize,
                total_size: pageCount * pageSize
            };
        }, 'Failed to get database size');
    }

    /**
     * 优化数据库
     */
    static async optimizeDatabase(): Promise<DatabaseResult<void>> {
        return await this.safeExecute(async () => {
            const db = await getDatabase();

            // 分析查询计划
            await db.execute('ANALYZE');

            // 重建数据库以减少碎片
            await db.execute('VACUUM');

            // 重新索引
            await db.execute('REINDEX');
        }, 'Failed to optimize database');
    }

    /**
     * 获取数据库统计信息
     */
    static async getDatabaseStats(): Promise<
        DatabaseResult<{
            total_books: number;
            total_reading_sessions: number;
            total_reading_time: number;
            average_books_per_status: Record<string, number>;
            database_size: number;
        }>
    > {
        return await this.safeExecute(async () => {
            const db = await getDatabase();

            // 获取书籍总数
            const totalBooks = await BookService.getBookCount();

            // 获取阅读会话统计
            const sessionStats = await ReadingSessionService.getOverallReadingStats();

            // 获取各状态书籍数量
            const statusStats = await db.select<{ status: string; count: number }[]>(
                'SELECT status, COUNT(*) as count FROM books GROUP BY status'
            );

            const averageBooksByStatus: Record<string, number> = {};
            statusStats.forEach((stat: { status: string; count: number }) => {
                averageBooksByStatus[stat.status] = stat.count;
            });

            // 获取数据库大小
            const sizeResult = await this.getDatabaseSize();
            const databaseSize = sizeResult.success ? sizeResult.data!.total_size : 0;

            return {
                total_books: totalBooks,
                total_reading_sessions: sessionStats.total_sessions,
                total_reading_time: sessionStats.total_reading_time,
                average_books_per_status: averageBooksByStatus,
                database_size: databaseSize
            };
        }, 'Failed to get database statistics');
    }

    /**
     * 清理过期数据
     */
    static async cleanupExpiredData(
        options: {
            /** 删除多少天前的阅读会话 */
            cleanupSessionsOlderThanDays?: number;
            /** 是否结束超时的阅读会话 */
            endTimeoutSessions?: boolean;
            /** 超时时间（分钟） */
            sessionTimeoutMinutes?: number;
        } = {}
    ): Promise<
        DatabaseResult<{
            deletedSessions: number;
            endedTimeoutSessions: number;
        }>
    > {
        return await this.safeExecute(async () => {
            const db = await getDatabase();
            let deletedSessions = 0;
            let endedTimeoutSessions = 0;

            // 结束超时的阅读会话
            if (options.endTimeoutSessions !== false) {
                const timeoutMinutes = options.sessionTimeoutMinutes || 60;
                endedTimeoutSessions =
                    await ReadingSessionService.endTimeoutSessions(timeoutMinutes);
            }

            // 删除过期的阅读会话
            if (options.cleanupSessionsOlderThanDays) {
                const result = await db.execute(
                    `DELETE FROM reading_sessions 
					 WHERE datetime(created_at, '+${options.cleanupSessionsOlderThanDays} days') < datetime('now')`,
                    []
                );
                deletedSessions = result.rowsAffected || 0;
            }

            return {
                deletedSessions,
                endedTimeoutSessions
            };
        }, 'Failed to cleanup expired data');
    }

    /**
     * 重置数据库（删除所有数据）
     */
    static async resetDatabase(): Promise<DatabaseResult<void>> {
        return await this.safeExecute(async () => {
            const db = await getDatabase();

            // 删除所有数据
            await db.execute('DELETE FROM reading_sessions');
            await db.execute('DELETE FROM books');

            // 重置自增 ID
            await db.execute(
                'DELETE FROM sqlite_sequence WHERE name IN ("books", "reading_sessions")'
            );

            // 优化数据库
            await db.execute('VACUUM');
        }, 'Failed to reset database');
    }

    /**
     * 导出数据为 JSON
     */
    static async exportData(): Promise<
        DatabaseResult<{
            books: unknown[];
            reading_sessions: unknown[];
            export_time: string;
        }>
    > {
        return await this.safeExecute(async () => {
            const db = await getDatabase();

            const books = await db.select<unknown[]>('SELECT * FROM books');
            const readingSessions = await db.select<unknown[]>('SELECT * FROM reading_sessions');

            return {
                books,
                reading_sessions: readingSessions,
                export_time: new Date().toISOString()
            };
        }, 'Failed to export data');
    }

    /**
     * 关闭数据库连接
     */
    static async close(): Promise<DatabaseResult<void>> {
        return await this.safeExecute(async () => {
            await closeDatabase();
        }, 'Failed to close database');
    }

    /**
     * 格式化文件大小
     */
    static formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 格式化阅读时间
     */
    static formatReadingTime(minutes: number): string {
        if (minutes < 60) {
            return `${minutes} 分钟`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours < 24) {
            return remainingMinutes > 0
                ? `${hours} 小时 ${remainingMinutes} 分钟`
                : `${hours} 小时`;
        }

        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;

        return remainingHours > 0 ? `${days} 天 ${remainingHours} 小时` : `${days} 天`;
    }

    /**
     * 验证阅读进度 JSON
     */
    static validateProgressJson(progressJson: string): boolean {
        try {
            JSON.parse(progressJson);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 验证标签 JSON
     */
    static validateTagsJson(tagsJson: string): boolean {
        try {
            const tags = JSON.parse(tagsJson);
            return Array.isArray(tags) && tags.every((tag) => typeof tag === 'string');
        } catch {
            return false;
        }
    }
}

/**
 * 从文件系统路径添加书籍
 * @param filePath 文件路径
 * @returns 数据库操作结果
 */
export async function addBookByFsPath(filePath: string): Promise<DatabaseResult<Book>> {
    if (!isSupportFormat(filePath)) {
        return {
            success: false,
            error: `不支持的文件类型: ${filePath}`
        };
    }

    // 检查书籍是否已存在
    const existingBook = await BookService.getBookByPath(filePath);

    if (existingBook) {
        return {
            success: false,
            data: existingBook,
            error: `书籍 ${existingBook.title} 已存在`
        };
    }

    console.log('add book', filePath);

    // 添加新书籍
    const title = (() => {
        const fileName = filePath.split(/[\\/]/).pop() || 'Unknown';
        const temp = fileName.split('.');
        temp.pop();
        return temp.join('.');
    })();

    // todo: author
    const createResult = await BookService.createBook({
        path: filePath,
        title: title,
        author: '',
        format: getFileFormat(filePath) as BookFormat,
        storage_type: StorageType.FILESYSTEM
    });

    return createResult;
}
