import { getDatabase } from './config';

/**
 * 阅读会话数据模型
 */
export interface ReadingSession {
    id: number;
    book_id: number;
    start_time: string;
    end_time?: string;
    duration_minutes: number;
    start_progress?: string;
    end_progress?: string;
    characters_read: number;
    created_at: string;
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
     */
    static async startSession(input: CreateReadingSessionInput): Promise<ReadingSession> {
        const db = await getDatabase();

        const result = await db.execute(
            `INSERT INTO reading_sessions (book_id, start_progress) VALUES (?, ?)`,
            [input.book_id, input.start_progress || null]
        );

        const sessionId = result.lastInsertId as number;
        return await this.getSessionById(sessionId);
    }

    /**
     * 结束阅读会话
     */
    static async endSession(
        sessionId: number,
        input: EndReadingSessionInput
    ): Promise<ReadingSession> {
        const db = await getDatabase();

        // 计算阅读时长
        const session = await this.getSessionById(sessionId);
        const startTime = new Date(session.start_time);
        const endTime = new Date();
        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

        await db.execute(
            `UPDATE reading_sessions 
			 SET end_time = datetime('now'), 
			     duration_minutes = ?, 
			     end_progress = ?, 
			     characters_read = ?
			 WHERE id = ?`,
            [durationMinutes, input.end_progress || null, input.characters_read || 0, sessionId]
        );

        return await this.getSessionById(sessionId);
    }

    /**
     * 根据 ID 获取阅读会话
     */
    static async getSessionById(id: number): Promise<ReadingSession> {
        const db = await getDatabase();

        const result = await db.select<ReadingSession[]>(
            'SELECT * FROM reading_sessions WHERE id = ?',
            [id]
        );

        if (result.length === 0) {
            throw new Error(`Reading session with id ${id} not found`);
        }

        return result[0];
    }

    /**
     * 获取书籍的阅读会话列表
     */
    static async getSessionsByBookId(bookId: number, limit?: number): Promise<ReadingSession[]> {
        const db = await getDatabase();

        let query = 'SELECT * FROM reading_sessions WHERE book_id = ? ORDER BY start_time DESC';
        const params: any[] = [bookId];

        if (limit) {
            query += ' LIMIT ?';
            params.push(limit);
        }

        return await db.select<ReadingSession[]>(query, params);
    }

    /**
     * 获取当前活跃的阅读会话
     */
    static async getActiveSession(bookId: number): Promise<ReadingSession | null> {
        const db = await getDatabase();

        const result = await db.select<ReadingSession[]>(
            'SELECT * FROM reading_sessions WHERE book_id = ? AND end_time IS NULL ORDER BY start_time DESC LIMIT 1',
            [bookId]
        );

        return result.length > 0 ? result[0] : null;
    }

    /**
     * 获取书籍的阅读统计信息
     */
    static async getBookReadingStats(bookId: number): Promise<ReadingSessionStats> {
        const db = await getDatabase();

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
			 WHERE book_id = ? AND end_time IS NOT NULL`,
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
    }

    /**
     * 获取用户的总体阅读统计
     */
    static async getOverallReadingStats(): Promise<ReadingSessionStats> {
        const db = await getDatabase();

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
			 WHERE end_time IS NOT NULL`
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
    }

    /**
     * 删除阅读会话
     */
    static async deleteSession(id: number): Promise<void> {
        const db = await getDatabase();

        const result = await db.execute('DELETE FROM reading_sessions WHERE id = ?', [id]);

        if (result.rowsAffected === 0) {
            throw new Error(`Reading session with id ${id} not found`);
        }
    }

    /**
     * 删除书籍的所有阅读会话
     */
    static async deleteSessionsByBookId(bookId: number): Promise<void> {
        const db = await getDatabase();

        await db.execute('DELETE FROM reading_sessions WHERE book_id = ?', [bookId]);
    }

    /**
     * 获取最近的阅读会话
     */
    static async getRecentSessions(limit: number = 10): Promise<ReadingSession[]> {
        const db = await getDatabase();

        return await db.select<ReadingSession[]>(
            'SELECT * FROM reading_sessions ORDER BY start_time DESC LIMIT ?',
            [limit]
        );
    }

    /**
     * 自动结束超时的阅读会话
     * @param timeoutMinutes 超时时间（分钟），默认 60 分钟
     */
    static async endTimeoutSessions(timeoutMinutes: number = 60): Promise<number> {
        const db = await getDatabase();

        // 查找超时的会话
        const timeoutSessions = await db.select<ReadingSession[]>(
            `SELECT * FROM reading_sessions 
			 WHERE end_time IS NULL 
			 AND datetime(start_time, '+${timeoutMinutes} minutes') < datetime('now')`
        );

        // 结束超时的会话
        for (const session of timeoutSessions) {
            const startTime = new Date(session.start_time);
            const endTime = new Date(startTime.getTime() + timeoutMinutes * 60 * 1000);

            await db.execute(
                `UPDATE reading_sessions 
				 SET end_time = ?, duration_minutes = ?
				 WHERE id = ?`,
                [endTime.toISOString(), timeoutMinutes, session.id]
            );
        }

        return timeoutSessions.length;
    }
}
