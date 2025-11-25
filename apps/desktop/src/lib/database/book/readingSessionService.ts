import { getDatabase } from './config';
import type { DatabaseResult } from '../types';
import { softDelete, buildSoftDeleteCondition } from '../utils/softDelete';
import { DB_ENUM } from '../const';
import { BookDbUtils } from '.';

/**
 * 阅读会话数据模型
 */
export interface ReadingSession {
    id: number;
    book_id: number;
    start_time: number;
    end_time?: number;
    duration_minutes: number;
    start_progress?: string;
    end_progress?: string;
    characters_read: number;
    created_at: number;
    deleted_at?: number;
}

/**
 * 创建阅读会话的输入数据
 */
export interface CreateReadingSessionInput {
    book_id: number;
    start_progress?: string;
}

/**
 * 结束阅读会话的输入数据
 */
export interface EndReadingSessionInput {
    end_progress?: string;
    characters_read?: number;
}

/**
 * 阅读会话统计信息
 */
export interface ReadingSessionStats {
    total_sessions: number;
    total_reading_time: number;
    average_session_duration: number;
    total_characters_read: number;
    average_reading_speed: number;
}

/**
 * 阅读会话服务类
 */
export class ReadingSessionService {
    /**
     * 开始新的阅读会话
     * 允许一本书有多个活跃会话，不会自动结束之前的会话
     */
    static async startSession(input: CreateReadingSessionInput): Promise<DatabaseResult<ReadingSession>> {
        return await BookDbUtils.safeExecute(
            async () => {
                const db = await getDatabase();

                const result = await db.execute(
                    `INSERT INTO reading_sessions (book_id, start_progress) VALUES (?, ?)`,
                    [input.book_id, input.start_progress || null]
                );

                const sessionId = result.lastInsertId as number;
                const sessionResult = await this.getSessionById(sessionId);
                if (!sessionResult.success) {
                    throw new Error(sessionResult.error || 'Failed to get created session');
                }
                return sessionResult.data!;
            },
            'Failed to start reading session',
        );
    }

    /**
     * 结束阅读会话
     * 通过 sessionId 指定要关闭的会话，不会影响其他活跃会话
     */
    static async endSession(
        sessionId: number,
        input: EndReadingSessionInput
    ): Promise<DatabaseResult<ReadingSession>> {
        return await BookDbUtils.safeExecute(
            async () => {
                const db = await getDatabase();

                // 计算阅读时长
                const sessionResult = await this.getSessionById(sessionId);
                if (!sessionResult.success) {
                    throw new Error(sessionResult.error || 'Session not found');
                }
                const session = sessionResult.data!;
                const endTime = Math.floor(Date.now() / 1000); // Unix 时间戳（秒）
                const durationMinutes = Math.round((endTime - session.start_time) / 60);

                const softDeleteCondition = buildSoftDeleteCondition();
                await db.execute(
                    `UPDATE reading_sessions 
					 SET end_time = strftime('%s', 'now'), 
					     duration_minutes = ?, 
					     end_progress = ?, 
					     characters_read = ?
					 WHERE id = ? AND ${softDeleteCondition}`,
                    [durationMinutes, input.end_progress || null, input.characters_read || 0, sessionId]
                );

                const updatedResult = await this.getSessionById(sessionId);
                if (!updatedResult.success) {
                    throw new Error(updatedResult.error || 'Failed to get updated session');
                }
                return updatedResult.data!;
            },
            'Failed to end reading session',
        );
    }

    /**
     * 根据 ID 获取阅读会话
     */
    static async getSessionById(id: number): Promise<DatabaseResult<ReadingSession>> {
        return await BookDbUtils.safeExecute(
            async () => {
                const db = await getDatabase();

                const softDeleteCondition = buildSoftDeleteCondition();
                const result = await db.select<ReadingSession[]>(
                    `SELECT * FROM reading_sessions WHERE id = ? AND ${softDeleteCondition}`,
                    [id]
                );

                if (result.length === 0) {
                    throw new Error(`Reading session with id ${id} not found`);
                }

                return result[0];
            },
            'Failed to get reading session',
        );
    }

    /**
     * 获取书籍的阅读会话列表
     */
    static async getSessionsByBookId(bookId: number, limit?: number): Promise<DatabaseResult<ReadingSession[]>> {
        return await BookDbUtils.safeExecute(
            async () => {
                const db = await getDatabase();

                const softDeleteCondition = buildSoftDeleteCondition();
                let query = `SELECT * FROM reading_sessions WHERE book_id = ? AND ${softDeleteCondition} ORDER BY start_time DESC`;
                const params: any[] = [bookId];

                if (limit) {
                    query += ' LIMIT ?';
                    params.push(limit);
                }

                return await db.select<ReadingSession[]>(query, params);
            },
            'Failed to get reading sessions',
        );
    }

    /**
     * 获取最新的一个活跃的阅读会话
     * 只返回指定书籍的最新活跃会话，如果需要获取所有活跃会话，请使用 getActiveSessions
     */
    static async getActiveSession(bookId: number): Promise<DatabaseResult<ReadingSession | null>> {
        return await BookDbUtils.safeExecute(
            async () => {
                const db = await getDatabase();

                const softDeleteCondition = buildSoftDeleteCondition();
                const result = await db.select<ReadingSession[]>(
                    `SELECT * FROM reading_sessions WHERE book_id = ? AND end_time IS NULL AND ${softDeleteCondition} ORDER BY start_time DESC LIMIT 1`,
                    [bookId]
                );

                return result.length > 0 ? result[0] : null;
            },
            'Failed to get active reading session',
        );
    }

    /**
     * 获取活跃的阅读会话列表
     * @param bookId 可选的书籍ID，如果提供则返回该书籍的所有活跃会话，否则返回所有书籍的所有活跃会话
     * @returns 活跃会话列表，按开始时间降序排列
     */
    static async getActiveSessions(bookId?: number): Promise<DatabaseResult<ReadingSession[]>> {
        return await BookDbUtils.safeExecute(
            async () => {
                const db = await getDatabase();

                const softDeleteCondition = buildSoftDeleteCondition();
                let query: string;
                let params: any[];

                if (bookId !== undefined) {
                    query = `SELECT * FROM reading_sessions WHERE book_id = ? AND end_time IS NULL AND ${softDeleteCondition} ORDER BY start_time DESC`;
                    params = [bookId];
                } else {
                    query = `SELECT * FROM reading_sessions WHERE end_time IS NULL AND ${softDeleteCondition} ORDER BY start_time DESC`;
                    params = [];
                }

                return await db.select<ReadingSession[]>(query, params);
            },
            'Failed to get active reading sessions',
        );
    }

    /**
     * 获取书籍的阅读统计信息
     */
    static async getBookReadingStats(bookId: number): Promise<DatabaseResult<ReadingSessionStats>> {
        return await BookDbUtils.safeExecute(
            async () => {
                const db = await getDatabase();

                const softDeleteCondition = buildSoftDeleteCondition();
                const result = await db.select<
                    {
                        total_sessions: number;
                        total_reading_time: number;
                        total_characters_read: number;
                    }[]
                >(
                    `SELECT 
						COUNT(*) as total_sessions,
						COALESCE(SUM(duration_minutes), 0) as total_reading_time,
						COALESCE(SUM(characters_read), 0) as total_characters_read
					 FROM reading_sessions 
					 WHERE book_id = ? AND end_time IS NOT NULL AND ${softDeleteCondition}`,
                    [bookId]
                );

                const stats = result[0];
                const averageSessionDuration =
                    stats.total_sessions > 0 ? stats.total_reading_time / stats.total_sessions : 0;

                const averageReadingSpeed =
                    stats.total_reading_time > 0
                        ? stats.total_characters_read / stats.total_reading_time
                        : 0;

                return {
                    total_sessions: stats.total_sessions,
                    total_reading_time: stats.total_reading_time,
                    average_session_duration: Math.round(averageSessionDuration * 100) / 100,
                    total_characters_read: stats.total_characters_read,
                    average_reading_speed: Math.round(averageReadingSpeed * 100) / 100
                };
            },
            'Failed to get book reading stats',
        );
    }

    /**
     * 获取用户的总体阅读统计
     */
    static async getOverallReadingStats(): Promise<DatabaseResult<ReadingSessionStats>> {
        return await BookDbUtils.safeExecute(
            async () => {
                const db = await getDatabase();

                const softDeleteCondition = buildSoftDeleteCondition();
                const result = await db.select<
                    {
                        total_sessions: number;
                        total_reading_time: number;
                        total_characters_read: number;
                    }[]
                >(
                    `SELECT 
						COUNT(*) as total_sessions,
						COALESCE(SUM(duration_minutes), 0) as total_reading_time,
						COALESCE(SUM(characters_read), 0) as total_characters_read
					 FROM reading_sessions 
					 WHERE end_time IS NOT NULL AND ${softDeleteCondition}`
                );

                const stats = result[0];
                const averageSessionDuration =
                    stats.total_sessions > 0 ? stats.total_reading_time / stats.total_sessions : 0;

                const averageReadingSpeed =
                    stats.total_reading_time > 0
                        ? stats.total_characters_read / stats.total_reading_time
                        : 0;

                return {
                    total_sessions: stats.total_sessions,
                    total_reading_time: stats.total_reading_time,
                    average_session_duration: Math.round(averageSessionDuration * 100) / 100,
                    total_characters_read: stats.total_characters_read,
                    average_reading_speed: Math.round(averageReadingSpeed * 100) / 100
                };
            },
            'Failed to get overall reading stats',
        );
    }

    /**
     * 删除阅读会话
     */
    static async deleteSession(id: number): Promise<DatabaseResult<void>> {
        return await BookDbUtils.safeExecute(
            async () => {
                const success = await softDelete(DB_ENUM.books, 'reading_sessions', id);
                if (!success) {
                    throw new Error(`Reading session with id ${id} not found`);
                }
                return undefined;
            },
            'Failed to delete reading session',
        );
    }

    /**
     * 删除书籍的所有阅读会话
     */
    static async deleteSessionsByBookId(bookId: number): Promise<DatabaseResult<void>> {
        return await BookDbUtils.safeExecute(
            async () => {
                const db = await getDatabase();

                // 先获取所有需要软删除的会话ID
                const softDeleteCondition = buildSoftDeleteCondition();
                const sessions = await db.select<{ id: number }[]>(
                    `SELECT id FROM reading_sessions WHERE book_id = ? AND ${softDeleteCondition}`,
                    [bookId]
                );

                // 批量软删除
                for (const session of sessions) {
                    await softDelete(DB_ENUM.books, 'reading_sessions', session.id);
                }
                return undefined;
            },
            'Failed to delete reading sessions by book id',
        );
    }

    /**
     * 获取最近的阅读会话
     */
    static async getRecentSessions(limit: number = 10): Promise<DatabaseResult<ReadingSession[]>> {
        return await BookDbUtils.safeExecute(
            async () => {
                const db = await getDatabase();

                const softDeleteCondition = buildSoftDeleteCondition();
                return await db.select<ReadingSession[]>(
                    `SELECT * FROM reading_sessions WHERE ${softDeleteCondition} ORDER BY start_time DESC LIMIT ?`,
                    [limit]
                );
            },
            'Failed to get recent reading sessions',
        );
    }

    /**
     * 自动结束超时的阅读会话
     * @param timeoutMinutes 超时时间（分钟），默认 360 分钟
     */
    static async endTimeoutSessions(timeoutMinutes: number = 360): Promise<DatabaseResult<number>> {
        return await BookDbUtils.safeExecute(
            async () => {
                const db = await getDatabase();

                // 查找超时的会话（start_time + timeoutMinutes < 当前时间）
                const softDeleteCondition = buildSoftDeleteCondition();
                const timeoutSessions = await db.select<ReadingSession[]>(
                    `SELECT * FROM reading_sessions 
					 WHERE end_time IS NULL 
					 AND (start_time + ?) < strftime('%s', 'now')
					 AND ${softDeleteCondition}`,
                    [timeoutMinutes * 60]
                );

                // 结束超时的会话
                const currentTime = Math.floor(Date.now() / 1000);
                for (const session of timeoutSessions) {
                    const durationMinutes = Math.round((currentTime - session.start_time) / 60);

                    const softDeleteCondition = buildSoftDeleteCondition();
                    await db.execute(
                        `UPDATE reading_sessions 
						 SET end_time = ?, duration_minutes = ?
						 WHERE id = ? AND ${softDeleteCondition}`,
                        [currentTime, durationMinutes, session.id]
                    );
                }

                return timeoutSessions.length;
            },
            'Failed to end timeout sessions',
        );
    }
}
