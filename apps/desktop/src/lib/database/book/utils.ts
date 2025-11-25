import { getDatabase, closeDatabase } from './config';
import { BookService } from './bookService';
import { ReadingSessionService } from './readingSessionService';
import type { DatabaseResult } from '../types';
import { DatabaseErrorHandler } from '../utils/databaseErrorHandler';
import { BookFormat, getFileFormat, isSupportFormat, StorageType, type Book } from './book';
import { DB_ENUM } from '../const';
import { isValidJSON } from '../utils/json';

/**
 * 查询包含特定标签的书籍
 * @param tag 标签名称
 * @returns 书籍 ID 数组
 */
export async function findBooksByTag(tag: string): Promise<number[]> {
    const db = await getDatabase();

    // 使用 JSON1 扩展查询标签数组
    const result = await db.select<{ id: number }[]>(
        `SELECT id FROM books 
         WHERE deleted_at IS NULL 
         AND json_extract(tags, '$[*]') LIKE ?`,
        [`%"${tag}"%`]
    );

    return result.map(r => r.id);
}

/**
 * 查询包含任意指定标签的书籍
 * @param tags 标签名称数组
 * @returns 书籍 ID 数组
 */
export async function findBooksByTags(tags: string[]): Promise<number[]> {
    if (tags.length === 0) {
        return [];
    }

    const db = await getDatabase();

    // 构建查询条件
    const conditions = tags.map(() => `json_extract(tags, '$[*]') LIKE ?`).join(' OR ');
    const params = tags.map(tag => `%"${tag}"%`);

    const result = await db.select<{ id: number }[]>(
        `SELECT DISTINCT id FROM books 
         WHERE deleted_at IS NULL 
         AND (${conditions})`,
        params
    );

    return result.map(r => r.id);
}


/**
 * 验证阅读进度 JSON
 * @param progressJson JSON 字符串
 * @returns 是否有效
 */
export function validateProgressJson(progressJson: string): boolean {
    return isValidJSON(progressJson);
}

/**
 * 验证标签 JSON
 * @param tagsJson JSON 字符串
 * @returns 是否有效（确保是字符串数组）
 */
export function validateTagsJson(tagsJson: string): boolean {
    try {
        const tags = JSON.parse(tagsJson);
        return Array.isArray(tags) && tags.every((tag) => typeof tag === 'string');
    } catch {
        return false;
    }
}

/**
 * 数据库工具类
 */
export class DatabaseUtils {
    /**
     * 安全执行数据库操作的包装函数（包含数据库名称）
     */
    static async safeExecute<T>(
        operation: () => Promise<T>,
        errorMessage: string = 'Database operation failed'
    ): Promise<DatabaseResult<T>> {
        return await DatabaseErrorHandler.safeExecute(operation, errorMessage, DB_ENUM.books);
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
            const sessionStatsResult = await ReadingSessionService.getOverallReadingStats();
            if (!sessionStatsResult.success) {
                throw new Error(sessionStatsResult.error || 'Failed to get session stats');
            }
            const sessionStats = sessionStatsResult.data!;

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
                const timeoutResult = await ReadingSessionService.endTimeoutSessions(timeoutMinutes);
                if (!timeoutResult.success) {
                    throw new Error(timeoutResult.error || 'Failed to end timeout sessions');
                }
                endedTimeoutSessions = timeoutResult.data!;
            }

            // 删除过期的阅读会话
            if (options.cleanupSessionsOlderThanDays) {
                const cutoffTime = Math.floor(Date.now() / 1000) - (options.cleanupSessionsOlderThanDays * 24 * 60 * 60);
                const result = await db.execute(
                    `DELETE FROM reading_sessions 
					 WHERE created_at < ?`,
                    [cutoffTime]
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

