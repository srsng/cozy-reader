// 类型导入
import type { ReadingSession, NewReadingSession, ReadingSessionUpdate, ReadingSessionQueryOptions, CreateReadingSessionInput, EndReadingSessionInput, ReadingSessionStats } from '../../core/types/books';
import type { DatabaseResult } from '../../core/types';
import type Database from '@tauri-apps/plugin-sql';

// 值导入
import { executeSelect, executeUpdate } from '../../core/execution';
import { READING_SESSIONS_DEFAULTS } from '../../../drizzle/books/schema-defaults';
import { readingSessionsAllowedUpdateFields } from '../../../drizzle/books/schema';
import { serializeJSON } from '../../core/serialization';
import { createTransaction } from '../../core/database';

// 基类导入
import { BaseService } from '../BaseService';

/**
 * 阅读会话服务
 * 继承基础服务类，提供阅读会话相关的 CRUD 操作（单例模式）
 */
export class ReadingSessionService extends BaseService<ReadingSession, NewReadingSession, ReadingSessionUpdate, ReadingSessionQueryOptions> {
    private static instance: ReadingSessionService;

    /**
     * 私有构造函数
     */
    private constructor() {
        super({
            databaseName: 'books',
            tableName: 'reading_sessions',
            defaultSortField: 'start_time',
            sortFieldMap: {
                'startTime': 'start_time',
                'endTime': 'end_time',
                'duration': 'duration'
            },
            allowedUpdateFields: readingSessionsAllowedUpdateFields,
            jsonFields: [
                { fieldName: 'start_progress', defaultValue: READING_SESSIONS_DEFAULTS.startProgress, nullable: true },
                { fieldName: 'end_progress', defaultValue: READING_SESSIONS_DEFAULTS.endProgress, nullable: true }
            ]
        });
    }

    /**
     * 获取单例实例
     */
    static getInstance(): ReadingSessionService {
        if (!ReadingSessionService.instance) {
            ReadingSessionService.instance = new ReadingSessionService();
        }
        return ReadingSessionService.instance;
    }

    // ===== 静态方法包装（简化调用）=====

    /**
     * 根据 ID 获取阅读会话（静态方法）
     * @param id 阅读会话 ID
     * @param includeDeleted 是否包含已删除记录，默认 false
     * @returns 阅读会话记录
     */
    static async getById(id: number, includeDeleted: boolean = false): Promise<DatabaseResult<ReadingSession>> {
        return ReadingSessionService.getInstance().getById(id, includeDeleted);
    }

    /**
     * 列表查询阅读会话（静态方法）
     * @param options 查询选项
     * @param includeDeleted 是否包含已删除记录，默认 false
     * @returns 阅读会话列表
     */
    static async list(options?: ReadingSessionQueryOptions, includeDeleted: boolean = false): Promise<DatabaseResult<ReadingSession[]>> {
        return ReadingSessionService.getInstance().list(options, includeDeleted);
    }

    /**
     * 获取阅读会话总数（静态方法）
     * @param options 查询选项
     * @param includeDeleted 是否包含已删除记录，默认 false
     * @returns 总数
     */
    static async getCount(options?: ReadingSessionQueryOptions, includeDeleted: boolean = false): Promise<DatabaseResult<number>> {
        return ReadingSessionService.getInstance().getCount(options, includeDeleted);
    }

    /**
     * 软删除阅读会话（静态方法）
     * @param id 阅读会话 ID
     */
    static async softDelete(id: number): Promise<DatabaseResult<void>> {
        return ReadingSessionService.getInstance().softDelete(id);
    }

    /**
     * 硬删除阅读会话（静态方法）
     * @param id 阅读会话 ID
     */
    static async hardDelete(id: number): Promise<DatabaseResult<void>> {
        return ReadingSessionService.getInstance().hardDelete(id);
    }

    /**
     * 恢复已删除的阅读会话（静态方法）
     * @param id 阅读会话 ID
     * @returns 恢复后的阅读会话记录
     */
    static async restore(id: number): Promise<DatabaseResult<ReadingSession>> {
        return ReadingSessionService.getInstance().restore(id);
    }

    /**
     * 根据书籍 ID 查询阅读会话列表（静态方法）
     * @param bookId 书籍 ID
     * @returns 阅读会话列表
     */
    static async listByBookId(bookId: number): Promise<DatabaseResult<ReadingSession[]>> {
        return ReadingSessionService.getInstance().listByBookId(bookId);
    }

    /**
     * 开始新的阅读会话（静态方法）
     * @param input 创建阅读会话输入
     * @returns 创建的阅读会话
     */
    static async startSession(input: CreateReadingSessionInput): Promise<DatabaseResult<ReadingSession>> {
        return ReadingSessionService.getInstance().startSession(input);
    }

    /**
     * 结束阅读会话（静态方法）
     * @param id 阅读会话 ID
     * @param input 结束阅读会话输入
     * @returns 更新后的阅读会话
     */
    static async endSession(id: number, input: EndReadingSessionInput): Promise<DatabaseResult<ReadingSession>> {
        return ReadingSessionService.getInstance().endSession(id, input);
    }

    // /**
    //  * 获取活跃会话（静态方法）
    //  * @param bookId 书籍 ID
    //  * @returns 活跃会话或 null
    //  */
    // static async getActive(bookId: number): Promise<DatabaseResult<ReadingSession | null>> {
    //     return ReadingSessionService.getInstance().getActive(bookId);
    // }

    /**
     * 获取活跃会话列表（静态方法）
     * @param bookId 书籍 ID（可选，如果提供则只返回该书籍的活跃会话）
     * @returns 活跃会话列表
     */
    static async getActiveList(bookId?: number): Promise<DatabaseResult<ReadingSession[]>> {
        return ReadingSessionService.getInstance().getActiveList(bookId);
    }

    /**
     * 获取书籍阅读统计（静态方法）
     * @param bookId 书籍 ID
     * @returns 阅读统计数据
     */
    static async getBookStats(bookId: number): Promise<DatabaseResult<ReadingSessionStats>> {
        return ReadingSessionService.getInstance().getBookStats(bookId);
    }

    /**
     * 获取总体阅读统计（静态方法）
     * @returns 总体阅读统计数据
     */
    static async getOverallStats(): Promise<DatabaseResult<ReadingSessionStats>> {
        return ReadingSessionService.getInstance().getOverallStats();
    }

    /**
     * 构建筛选条件
     */
    protected buildFilterConditions(
        options: ReadingSessionQueryOptions | undefined,
        conditions: string[],
        params: unknown[]
    ): void {
        // 书籍ID筛选
        if (options?.bookId) {
            conditions.push('book_id = ?');
            params.push(options.bookId);
        }
    }

    /**
     * 构建插入字段和值
     */
    protected buildInsertFields(input: NewReadingSession): {
        fields: string[];
        values: unknown[];
    } {
        const startProgress = input.startProgress ?? READING_SESSIONS_DEFAULTS.startProgress;
        const endProgress = input.endProgress ?? READING_SESSIONS_DEFAULTS.endProgress;

        return {
            fields: [
                'book_id',
                'start_time',
                'end_time',
                'duration',
                'start_progress',
                'end_progress',
                'characters_read'
            ],
            values: [
                input.bookId,
                input.startTime || Math.floor(Date.now() / 1000),
                input.endTime || null,
                input.duration ?? READING_SESSIONS_DEFAULTS.duration,
                serializeJSON(startProgress),
                serializeJSON(endProgress),
                input.charactersRead ?? READING_SESSIONS_DEFAULTS.charactersRead,
            ]
        };
    }

    /**
     * 构建更新字段
     */
    protected buildUpdateFields(input: ReadingSessionUpdate, updates: string[], params: unknown[]): void {
        if (input.endTime !== undefined) {
            updates.push('end_time = ?');
            params.push(input.endTime);
        }
        if (input.duration !== undefined) {
            updates.push('duration = ?');
            params.push(input.duration);
        }
        if (input.startProgress !== undefined) {
            updates.push('start_progress = ?');
            params.push(serializeJSON(input.startProgress));
        }
        if (input.endProgress !== undefined) {
            updates.push('end_progress = ?');
            params.push(serializeJSON(input.endProgress));
        }
        if (input.charactersRead !== undefined) {
            updates.push('characters_read = ?');
            params.push(input.charactersRead);
        }
    }

    // ===== 禁止直接调用的方法 =====

    /**
     * 创建阅读会话（已禁用）
     * 
     * 注意：请使用 startSession() 方法创建阅读会话，不要直接调用此方法
     * 
     * @deprecated 请使用 startSession() 方法
     * @throws Error 总是抛出错误，提示使用 startSession
     */
    async create(input: NewReadingSession): Promise<DatabaseResult<ReadingSession>> {
        return {
            success: false,
            error: 'Direct creation of reading sessions is not allowed. Please use startSession() method instead.',
            code: 'OPERATION_FAILED'
        };
    }

    /**
     * 更新阅读会话（已禁用）
     * 
     * 注意：请使用 endSession() 方法更新阅读会话，不要直接调用此方法
     * 
     * @deprecated 请使用 endSession() 方法
     * @throws Error 总是抛出错误，提示使用 endSession
     */
    async update(id: number, input: ReadingSessionUpdate): Promise<DatabaseResult<ReadingSession>> {
        return {
            success: false,
            error: 'Direct update of reading sessions is not allowed. Please use endSession() method instead.',
            code: 'OPERATION_FAILED'
        };
    }

    // ===== 查询方法组 =====

    /**
     * 根据书籍 ID 查询阅读会话列表
     * @param bookId 书籍 ID
     * @returns 阅读会话列表
     */
    async listByBookId(bookId: number): Promise<DatabaseResult<ReadingSession[]>> {
        return await this.list({ bookId });
    }

    // /**
    //  * 获取活跃会话（指定书籍的最新活跃会话）
    //  * @param bookId 书籍 ID
    //  * @returns 活跃会话或 null
    //  */
    // async getActive(bookId: number): Promise<DatabaseResult<ReadingSession | null>> {
    //     try {
    //         const db = await BaseService.getDatabase(this.config.databaseName);
    //         const softDeleteCondition = this.buildSoftDeleteWhere(false);

    //         const result = await executeSelect<Record<string, unknown>[]>(
    //             db,
    //             this.config.databaseName,
    //             `SELECT * FROM ${this.config.tableName} WHERE book_id = ? AND end_time IS NULL AND ${softDeleteCondition} ORDER BY start_time DESC LIMIT 1`,
    //             [bookId],
    //             {
    //                 operationName: 'ReadingSessionService.getActive'
    //             }
    //         );

    //         if (result.length === 0) {
    //             return { success: true, data: null };
    //         }

    //         const data = this.deserializeRecordJsonFields(result[0]);
    //         return { success: true, data };
    //     } catch (error) {
    //         return BaseService.handleError(error, this.config.databaseName);
    //     }
    // }

    /**
     * 获取活跃会话列表
     * @param bookId 书籍 ID（可选，如果提供则只返回该书籍的活跃会话）
     * @returns 活跃会话列表
     */
    async getActiveList(bookId?: number): Promise<DatabaseResult<ReadingSession[]>> {
        try {
            const db = await BaseService.getDatabase(this.config.databaseName);
            const softDeleteCondition = this.buildSoftDeleteWhere(false);

            let query: string;
            let params: unknown[];

            if (bookId !== undefined) {
                query = `SELECT * FROM ${this.config.tableName} WHERE book_id = ? AND end_time IS NULL AND ${softDeleteCondition} ORDER BY start_time DESC`;
                params = [bookId];
            } else {
                query = `SELECT * FROM ${this.config.tableName} WHERE end_time IS NULL AND ${softDeleteCondition} ORDER BY start_time DESC`;
                params = [];
            }

            const result = await executeSelect<Record<string, unknown>[]>(
                db,
                this.config.databaseName,
                query,
                params,
                {
                    operationName: 'ReadingSessionService.getActiveList'
                }
            );

            const data = result.map(record => this.deserializeRecordJsonFields(record));
            return { success: true, data };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    // ===== CRUD 扩展方法组 =====

    /**
     * 开始新的阅读会话
     * @param input 创建阅读会话输入
     * @returns 创建的阅读会话
     */
    async startSession(input: CreateReadingSessionInput): Promise<DatabaseResult<ReadingSession>> {
        try {
            const db = await BaseService.getDatabase(this.config.databaseName);

            const startProgress = input.startProgress ?? READING_SESSIONS_DEFAULTS.startProgress;

            const result = await executeUpdate(
                db,
                this.config.databaseName,
                `INSERT INTO ${this.config.tableName} (book_id, start_progress) VALUES (?, ?)`,
                [input.bookId, serializeJSON(startProgress)],
                { operationName: 'ReadingSessionService.startSession' }
            );

            return await super.getById(result.lastInsertId);
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    /**
     * 结束阅读会话
     * 
     * 注意：
     * - 触发器会自动更新书籍的 `last_read_at`, `current_progress`, `read_characters`, `status`
     * - 服务层负责计算重叠时间并更新 `reading_time`（单位：秒）
     * - 使用事务确保数据一致性
     * 
     * @param id 阅读会话 ID
     * @param input 结束阅读会话输入
     * @returns 更新后的阅读会话
     */
    async endSession(id: number, input: EndReadingSessionInput): Promise<DatabaseResult<ReadingSession>> {
        try {
            // 1. 获取会话并检查是否已结束
            const getByIdResult = await this.getById(id);
            if (!getByIdResult.success) {
                return getByIdResult;
            }
            const session = getByIdResult.data;

            // 检查会话是否已经结束
            if (session.endTime !== null) {
                return {
                    success: false,
                    error: `Session ${id} has already ended`,
                    code: 'OPERATION_FAILED'
                };
            }

            // 2. 计算结束时间和持续时间
            const endTime = Math.floor(Date.now() / 1000);
            const durationSeconds = endTime - session.startTime;

            // 检查持续时间是否为负数
            if (durationSeconds < 0) {
                return {
                    success: false,
                    error: `Invalid end time: end time (${endTime}) is before start time (${session.startTime})`,
                    code: 'OPERATION_FAILED'
                };
            }

            // 3. 在事务外计算重叠时间，提前发现数据不一致问题
            const db = await BaseService.getDatabase(this.config.databaseName);
            const endedSessions = await this._getEndedSessionsForOverlap(db, session.bookId, id, endTime);
            const overlapSeconds = this._calculateOverlapSeconds(session, endTime, endedSessions);
            const nonOverlapSeconds = durationSeconds - overlapSeconds;

            // 检查非重叠时长是否为负数（数据不一致）
            if (nonOverlapSeconds < 0) {
                return {
                    success: false,
                    error: `Calculated non-overlap seconds is negative: ${nonOverlapSeconds}. This may indicate data inconsistency. Duration: ${durationSeconds}, Overlap: ${overlapSeconds}`,
                    code: 'OPERATION_FAILED'
                };
            }

            // 4. 在事务内执行更新
            const transaction = createTransaction(db);
            const finalData = await transaction.run(async (db) => {
                // 在事务内重新获取会话并验证状态（并发安全）
                const currentSession = await this._getSessionInTransaction(db, id);
                if (currentSession.endTime !== null) {
                    throw new Error(`Session ${id} has already ended by another process`);
                }

                // 更新会话结束时间
                await this._updateSessionEndTime(db, id, endTime, durationSeconds, input);

                // 更新书籍阅读时间（仅在非重叠时长大于0时）
                if (nonOverlapSeconds > 0) {
                    await this._updateBookReadingTime(db, session.bookId, nonOverlapSeconds);
                }

                return await this._getSessionInTransaction(db, id);
            });

            return { success: true, data: finalData };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    /**
     * 更新会话的结束时间和相关字段
     * @param db 数据库连接
     * @param id 会话 ID
     * @param endTime 结束时间（Unix 时间戳）
     * @param durationSeconds 持续时间（秒）
     * @param input 结束会话输入
     * @throws Error 如果更新失败或会话已结束
     */
    private async _updateSessionEndTime(
        db: Database,
        id: number,
        endTime: number,
        durationSeconds: number,
        input: EndReadingSessionInput
    ): Promise<void> {
        const softDeleteCondition = this.buildSoftDeleteWhere(false);
        const result = await executeUpdate(
            db,
            this.config.databaseName,
            `UPDATE ${this.config.tableName} 
             SET end_time = ?, duration = ?, end_progress = ?, characters_read = ?
             WHERE id = ? AND end_time IS NULL AND ${softDeleteCondition}`,
            [
                endTime,
                durationSeconds,
                serializeJSON(input.endProgress ?? READING_SESSIONS_DEFAULTS.endProgress),
                input.charactersRead ?? READING_SESSIONS_DEFAULTS.charactersRead,
                id
            ],
            {
                operationName: 'ReadingSessionService.updateSessionEndTime'
            }
        );

        // 检查更新是否成功
        if (result.rowsAffected === 0) {
            throw new Error(`Failed to update session ${id}: session may have already ended or been deleted`);
        }
    }

    /**
     * 更新书籍的阅读时长
     * @param db 数据库连接
     * @param bookId 书籍 ID
     * @param seconds 要增加的阅读时长（秒）
     */
    private async _updateBookReadingTime(
        db: Database,
        bookId: number,
        seconds: number
    ): Promise<void> {
        if (seconds > 0) {
            await executeUpdate(
                db,
                this.config.databaseName,
                `UPDATE books SET reading_time = reading_time + ? WHERE id = ?`,
                [seconds, bookId],
                {
                    operationName: 'ReadingSessionService.updateBookReadingTime'
                }
            );
        }
    }

    /**
     * 查询已结束的会话用于计算重叠时间
     * @param db 数据库连接
     * @param bookId 书籍 ID
     * @param excludeSessionId 排除的会话 ID
     * @param endTime 结束时间（Unix 时间戳）
     * @returns 已结束的会话列表
     */
    private async _getEndedSessionsForOverlap(
        db: Database,
        bookId: number,
        excludeSessionId: number,
        endTime: number
    ): Promise<Array<{ id: number; start_time: number; end_time: number; duration: number }>> {
        const softDeleteCondition = this.buildSoftDeleteWhere(false);
        return await executeSelect<Array<{
            id: number;
            start_time: number;
            end_time: number;
            duration: number;
        }>>(
            db,
            this.config.databaseName,
            `SELECT id, start_time, end_time, duration 
             FROM ${this.config.tableName}
             WHERE book_id = ? 
               AND id != ? 
               AND end_time IS NOT NULL 
               AND end_time <= ?
               AND ${softDeleteCondition}`,
            [bookId, excludeSessionId, endTime],
            {
                operationName: 'ReadingSessionService.getEndedSessionsForOverlap'
            }
        );
    }

    /**
     * 计算当前会话与已结束会话的重叠时间总和（秒）
     * 
     * 处理多个会话同时重叠的情况：
     * 1. 收集所有重叠区间
     * 2. 合并重叠区间（避免重复计算）
     * 3. 计算合并后的总重叠时长
     * 
     * @param session 当前会话
     * @param endTime 结束时间（Unix 时间戳）
     * @param endedSessions 已结束的会话列表
     * @returns 重叠时间总和（秒）
     */
    private _calculateOverlapSeconds(
        session: ReadingSession,
        endTime: number,
        endedSessions: Array<{ start_time: number; end_time: number }>
    ): number {
        // 1. 收集所有重叠区间
        const overlapIntervals: Array<{ start: number; end: number }> = [];

        for (const otherSession of endedSessions) {
            const overlapStart = Math.max(session.startTime, otherSession.start_time);
            const overlapEnd = Math.min(endTime, otherSession.end_time);

            if (overlapStart < overlapEnd) {
                overlapIntervals.push({ start: overlapStart, end: overlapEnd });
            }
        }

        if (overlapIntervals.length === 0) {
            return 0;
        }

        // 2. 合并重叠区间
        const mergedIntervals = this._mergeIntervals(overlapIntervals);

        // 3. 计算合并后的总重叠时长（秒）
        let totalOverlapSeconds = 0;
        for (const interval of mergedIntervals) {
            totalOverlapSeconds += interval.end - interval.start;
        }

        return totalOverlapSeconds;
    }

    /**
     * 合并重叠的时间区间
     * 
     * 例如：
     * - 输入：[{start: 2:00, end: 3:00}, {start: 2:30, end: 3:30}]
     * - 输出：[{start: 2:00, end: 3:30}]
     * 
     * @param intervals 时间区间数组
     * @returns 合并后的时间区间数组
     */
    private _mergeIntervals(intervals: Array<{ start: number; end: number }>): Array<{ start: number; end: number }> {
        if (intervals.length === 0) {
            return [];
        }

        // 按开始时间排序
        const sorted = [...intervals].sort((a, b) => a.start - b.start);
        const merged: Array<{ start: number; end: number }> = [sorted[0]];

        for (let i = 1; i < sorted.length; i++) {
            const current = sorted[i];
            const last = merged[merged.length - 1];

            // 如果当前区间与最后一个合并区间重叠或相邻，则合并
            if (current.start <= last.end) {
                // 合并：更新结束时间为两者的最大值
                last.end = Math.max(last.end, current.end);
            } else {
                // 不重叠，添加新区间
                merged.push(current);
            }
        }

        return merged;
    }

    /**
     * 在事务内获取会话数据
     * @param db 数据库连接
     * @param id 会话 ID
     * @returns 会话数据
     * @throws Error 如果会话不存在或已被删除
     */
    private async _getSessionInTransaction(db: Database, id: number): Promise<ReadingSession> {
        const softDeleteCondition = this.buildSoftDeleteWhere(false);
        const result = await executeSelect<Record<string, unknown>[]>(
            db,
            this.config.databaseName,
            `SELECT * FROM ${this.config.tableName} WHERE id = ? AND ${softDeleteCondition}`,
            [id],
            {
                operationName: 'ReadingSessionService.getSessionInTransaction'
            }
        );

        if (result.length === 0) {
            throw new Error(`Failed to retrieve session with id ${id}. Session may have been deleted or does not exist.`);
        }

        return this.deserializeRecordJsonFields(result[0]);
    }

    // ===== 统计方法组 =====

    /**
     * 获取书籍阅读统计
     * @param bookId 书籍 ID
     * @returns 阅读统计数据
     */
    async getBookStats(bookId: number): Promise<DatabaseResult<ReadingSessionStats>> {
        try {
            const db = await BaseService.getDatabase(this.config.databaseName);
            const softDeleteCondition = this.buildSoftDeleteWhere(false);

            const result = await executeSelect<{
                total_sessions: number;
                total_reading_time: number;
                total_characters_read: number;
            }[]>(
                db,
                this.config.databaseName,
                `SELECT 
                COUNT(*) as total_sessions,
                COALESCE(SUM(duration), 0) as total_reading_time,
                COALESCE(SUM(characters_read), 0) as total_characters_read
             FROM ${this.config.tableName} 
             WHERE book_id = ? AND end_time IS NOT NULL AND ${softDeleteCondition}`,
                [bookId],
                {
                    operationName: 'ReadingSessionService.getBookStats'
                }
            );

            const stats = result[0];
            const averageSessionDuration =
                stats.total_sessions > 0 ? stats.total_reading_time / stats.total_sessions : 0;

            const averageReadingSpeed =
                stats.total_reading_time > 0
                    ? stats.total_characters_read / stats.total_reading_time
                    : 0;

            const data: ReadingSessionStats = {
                totalSessions: stats.total_sessions,
                totalReadingTime: stats.total_reading_time,
                averageSessionDuration: Math.round(averageSessionDuration * 100) / 100,
                totalCharactersRead: stats.total_characters_read,
                averageReadingSpeed: Math.round(averageReadingSpeed * 100) / 100
            };

            return { success: true, data };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    /**
     * 获取总体阅读统计
     * @returns 总体阅读统计数据
     */
    async getOverallStats(): Promise<DatabaseResult<ReadingSessionStats>> {
        try {
            const db = await BaseService.getDatabase(this.config.databaseName);
            const softDeleteCondition = this.buildSoftDeleteWhere(false);

            const result = await executeSelect<{
                total_sessions: number;
                total_reading_time: number;
                total_characters_read: number;
            }[]>(
                db,
                this.config.databaseName,
                `SELECT 
                COUNT(*) as total_sessions,
                COALESCE(SUM(duration), 0) as total_reading_time,
                COALESCE(SUM(characters_read), 0) as total_characters_read
             FROM ${this.config.tableName} 
             WHERE end_time IS NOT NULL AND ${softDeleteCondition}`,
                [],
                {
                    operationName: 'ReadingSessionService.getOverallStats'
                }
            );

            const stats = result[0];
            const averageSessionDuration =
                stats.total_sessions > 0 ? stats.total_reading_time / stats.total_sessions : 0;

            const averageReadingSpeed =
                stats.total_reading_time > 0
                    ? stats.total_characters_read / stats.total_reading_time
                    : 0;

            const data: ReadingSessionStats = {
                totalSessions: stats.total_sessions,
                totalReadingTime: stats.total_reading_time,
                averageSessionDuration: Math.round(averageSessionDuration * 100) / 100,
                totalCharactersRead: stats.total_characters_read,
                averageReadingSpeed: Math.round(averageReadingSpeed * 100) / 100
            };

            return { success: true, data };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    // ===== 工具方法组 =====
    // null
}
