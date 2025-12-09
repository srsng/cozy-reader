// 类型导入
import type { Comment, NewComment, CommentUpdate, CommentQueryOptions, CommentStatistics, BookCommentSummary, CommentType } from '../../core/types/books';
import type { DatabaseResult } from '../../core/types';

// 值导入
import { executeSelect } from '../../core/execution';
import { COMMENTS_DEFAULTS } from '../../../drizzle/books/schema-defaults';
import { commentsAllowedUpdateFields } from '../../../drizzle/books/schema';
import { buildSearchCondition, buildTagFilterCondition, escapeLikeQuery } from '../../core/query';
import { serializeJSON } from '../../core/serialization';

// 基类导入
import { BaseService } from '../BaseService';

/**
 * 评论服务
 * 继承基础服务类，提供评论相关的 CRUD 操作（单例模式）
 */
export class CommentService extends BaseService<Comment, NewComment, CommentUpdate, CommentQueryOptions> {
    private static instance: CommentService;

    /**
     * 私有构造函数
     */
    private constructor() {
        super({
            databaseName: 'books',
            tableName: 'comments',
            defaultSortField: 'created_at',
            sortFieldMap: {
                'createdAt': 'created_at',
                'updatedAt': 'updated_at',
                'commentType': 'comment_type'
            },
            allowedUpdateFields: commentsAllowedUpdateFields,
            jsonFields: [
                { fieldName: 'position_info', defaultValue: COMMENTS_DEFAULTS.positionInfo, nullable: true },
                { fieldName: 'tags', defaultValue: COMMENTS_DEFAULTS.tags, nullable: false }
            ]
        });
    }

    /**
     * 获取单例实例
     */
    static getInstance(): CommentService {
        if (!CommentService.instance) {
            CommentService.instance = new CommentService();
        }
        return CommentService.instance;
    }

    // ===== 静态方法包装（简化调用）=====

    /**
     * 根据 ID 获取评论（静态方法）
     * @param id 评论 ID
     * @param includeDeleted 是否包含已删除记录，默认 false
     * @returns 评论记录
     */
    static async getById(id: number, includeDeleted: boolean = false): Promise<DatabaseResult<Comment>> {
        return CommentService.getInstance().getById(id, includeDeleted);
    }

    /**
     * 创建评论（静态方法）
     * @param input 新评论数据
     * @returns 创建的评论记录
     */
    static async create(input: NewComment): Promise<DatabaseResult<Comment>> {
        return CommentService.getInstance().create(input);
    }

    /**
     * 更新评论（静态方法）
     * @param id 评论 ID
     * @param input 更新数据
     * @returns 更新后的评论记录
     */
    static async update(id: number, input: CommentUpdate): Promise<DatabaseResult<Comment>> {
        return CommentService.getInstance().update(id, input);
    }

    /**
     * 列表查询评论（静态方法）
     * @param options 查询选项
     * @param includeDeleted 是否包含已删除记录，默认 false
     * @returns 评论列表
     */
    static async list(options?: CommentQueryOptions, includeDeleted: boolean = false): Promise<DatabaseResult<Comment[]>> {
        return CommentService.getInstance().list(options, includeDeleted);
    }

    /**
     * 获取评论总数（静态方法）
     * @param options 查询选项
     * @param includeDeleted 是否包含已删除记录，默认 false
     * @returns 总数
     */
    static async getCount(options?: CommentQueryOptions, includeDeleted: boolean = false): Promise<DatabaseResult<number>> {
        return CommentService.getInstance().getCount(options, includeDeleted);
    }

    /**
     * 软删除评论（静态方法）
     * @param id 评论 ID
     */
    static async softDelete(id: number): Promise<DatabaseResult<void>> {
        return CommentService.getInstance().softDelete(id);
    }

    /**
     * 硬删除评论（静态方法）
     * @param id 评论 ID
     */
    static async hardDelete(id: number): Promise<DatabaseResult<void>> {
        return CommentService.getInstance().hardDelete(id);
    }

    /**
     * 恢复已删除的评论（静态方法）
     * @param id 评论 ID
     * @returns 恢复后的评论记录
     */
    static async restore(id: number): Promise<DatabaseResult<Comment>> {
        return CommentService.getInstance().restore(id);
    }

    /**
     * 根据书籍 ID 查询评论列表（静态方法）
     * @param bookId 书籍 ID
     * @returns 评论列表
     */
    static async listByBookId(bookId: number): Promise<DatabaseResult<Comment[]>> {
        return CommentService.getInstance().listByBookId(bookId);
    }

    /**
     * 获取评论统计信息（静态方法）
     * @param bookId 书籍 ID（可选，如果提供则只统计该书籍的评论）
     * @returns 评论统计信息
     */
    static async getStatistics(bookId?: number): Promise<DatabaseResult<CommentStatistics>> {
        return CommentService.getInstance().getStatistics(bookId);
    }

    /**
     * 获取书籍评论摘要（静态方法）
     * @param bookId 书籍 ID
     * @returns 书籍评论摘要
     */
    static async getBookSummary(bookId: number): Promise<DatabaseResult<BookCommentSummary>> {
        return CommentService.getInstance().getBookSummary(bookId);
    }

    /**
     * 构建筛选条件
     */
    protected buildFilterConditions(
        options: CommentQueryOptions | undefined,
        conditions: string[],
        params: unknown[]
    ): void {
        // 书籍ID筛选
        if (options?.bookId) {
            conditions.push('book_id = ?');
            params.push(options.bookId);
        }

        // 评论类型筛选
        if (options?.commentType) {
            conditions.push('comment_type = ?');
            params.push(options.commentType);
        }

        // 搜索条件
        if (options?.search) {
            const searchCondition = buildSearchCondition(options.search, ['content', 'selected_text'], escapeLikeQuery);
            if (searchCondition.condition) {
                conditions.push(searchCondition.condition);
                params.push(...searchCondition.params);
            }
        }

        // 标签筛选
        if (options?.tags && options.tags.length > 0) {
            const tagCondition = buildTagFilterCondition(options.tags);
            if (tagCondition.condition) {
                conditions.push(tagCondition.condition);
                params.push(...tagCondition.params);
            }
        }

        // 私有性筛选
        if (options?.isPrivate !== undefined) {
            conditions.push('is_private = ?');
            params.push(options.isPrivate ? 1 : 0);
        }

        // 外部ID筛选
        if (options?.externalId) {
            conditions.push('external_id = ?');
            params.push(options.externalId);
        }
    }

    /**
     * 构建插入字段和值
     */
    protected buildInsertFields(input: NewComment): {
        fields: string[];
        values: unknown[];
    } {
        const tags = input.tags ?? COMMENTS_DEFAULTS.tags;
        const positionInfo = input.positionInfo ?? COMMENTS_DEFAULTS.positionInfo;

        return {
            fields: [
                'book_id',
                'content',
                'comment_type',
                'position_info',
                'selected_text',
                'color',
                'tags',
                'is_private',
                'external_id'
            ],
            values: [
                input.bookId,
                input.content,
                input.commentType || COMMENTS_DEFAULTS.commentType,
                serializeJSON(positionInfo),
                input.selectedText || null,
                input.color || COMMENTS_DEFAULTS.color,
                serializeJSON(tags),
                input.isPrivate !== undefined ? (input.isPrivate ? 1 : 0) : COMMENTS_DEFAULTS.isPrivate,
                input.externalId || COMMENTS_DEFAULTS.externalId,
            ]
        };
    }

    /**
     * 构建更新字段
     */
    protected buildUpdateFields(input: CommentUpdate, updates: string[], params: unknown[]): void {
        if (input.content !== undefined) {
            updates.push('content = ?');
            params.push(input.content);
        }
        if (input.commentType !== undefined) {
            updates.push('comment_type = ?');
            params.push(input.commentType);
        }
        if (input.positionInfo !== undefined) {
            updates.push('position_info = ?');
            params.push(serializeJSON(input.positionInfo));
        }
        if (input.selectedText !== undefined) {
            updates.push('selected_text = ?');
            params.push(input.selectedText);
        }
        if (input.color !== undefined) {
            updates.push('color = ?');
            params.push(input.color);
        }
        if (input.tags !== undefined) {
            updates.push('tags = ?');
            params.push(serializeJSON(input.tags));
        }
        if (input.isPrivate !== undefined) {
            updates.push('is_private = ?');
            params.push(input.isPrivate ? 1 : 0);
        }
        if (input.externalId !== undefined) {
            updates.push('external_id = ?');
            params.push(input.externalId);
        }
    }

    // ===== 查询方法组 =====

    /**
     * 根据书籍 ID 查询评论列表
     * @param bookId 书籍 ID
     * @returns 评论列表
     */
    async listByBookId(bookId: number): Promise<DatabaseResult<Comment[]>> {
        return await this.list({ bookId });
    }

    // ===== 统计方法组 =====

    /**
     * 获取评论统计信息
     * @param bookId 书籍 ID（可选，如果提供则只统计该书籍的评论）
     * @returns 评论统计信息
     */
    async getStatistics(bookId?: number): Promise<DatabaseResult<CommentStatistics>> {
        try {
            const db = await BaseService.getDatabase(this.config.databaseName);
            const softDeleteCondition = this.buildSoftDeleteWhere(false);

            let query = `SELECT COUNT(*) as count FROM ${this.config.tableName}`;
            const params: unknown[] = [];

            if (bookId !== undefined) {
                query += ` WHERE book_id = ? AND ${softDeleteCondition}`;
                params.push(bookId);
            } else {
                query += ` WHERE ${softDeleteCondition}`;
            }

            const totalResult = await executeSelect<{ count: number }[]>(
                db,
                this.config.databaseName,
                query,
                params,
                {
                    operationName: 'CommentService.getStatistics.total'
                }
            );
            const totalComments = totalResult[0].count;

            // 获取各类型评论数量
            let typeQuery = `SELECT comment_type, COUNT(*) as count FROM ${this.config.tableName}`;
            const typeParams: unknown[] = [];
            if (bookId !== undefined) {
                typeQuery += ` WHERE book_id = ? AND ${softDeleteCondition}`;
                typeParams.push(bookId);
            } else {
                typeQuery += ` WHERE ${softDeleteCondition}`;
            }
            typeQuery += ' GROUP BY comment_type';

            const typeStats = await executeSelect<{ comment_type: CommentType; count: number }[]>(
                db,
                this.config.databaseName,
                typeQuery,
                typeParams,
                {
                    operationName: 'CommentService.getStatistics.byType'
                }
            );

            const byType: Record<CommentType, number> = {
                note: 0,
                highlight: 0,
                underline: 0,
                strike: 0,
                bookmark: 0,
                review: 0
            };

            typeStats.forEach((stat) => {
                byType[stat.comment_type] = stat.count;
            });

            // 获取各书籍的评论数
            let byBookQuery = `SELECT book_id, COUNT(*) as count FROM ${this.config.tableName}`;
            const byBookParams: unknown[] = [];
            if (bookId !== undefined) {
                byBookQuery += ` WHERE book_id = ? AND ${softDeleteCondition}`;
                byBookParams.push(bookId);
            } else {
                byBookQuery += ` WHERE ${softDeleteCondition}`;
            }
            byBookQuery += ' GROUP BY book_id';

            const byBookStats = await executeSelect<{ book_id: number; count: number }[]>(
                db,
                this.config.databaseName,
                byBookQuery,
                byBookParams,
                {
                    operationName: 'CommentService.getStatistics.byBook'
                }
            );

            const data: CommentStatistics = {
                totalComments,
                byType,
                byBook: byBookStats.map(stat => ({ bookId: stat.book_id, count: stat.count }))
            };
            return { success: true, data };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    /**
     * 获取书籍评论摘要
     * @param bookId 书籍 ID
     * @returns 书籍评论摘要
     */
    async getBookSummary(bookId: number): Promise<DatabaseResult<BookCommentSummary>> {
        try {
            const db = await BaseService.getDatabase(this.config.databaseName);
            const softDeleteCondition = this.buildSoftDeleteWhere(false);

            const result = await executeSelect<{
                comment_type: CommentType;
                count: number;
            }[]>(
                db,
                this.config.databaseName,
                `SELECT comment_type, COUNT(*) as count FROM ${this.config.tableName} WHERE book_id = ? AND ${softDeleteCondition} GROUP BY comment_type`,
                [bookId],
                {
                    operationName: 'CommentService.getBookSummary'
                }
            );

            const byType: Record<CommentType, number> = {
                note: 0,
                highlight: 0,
                underline: 0,
                strike: 0,
                bookmark: 0,
                review: 0
            };

            let totalComments = 0;
            result.forEach((stat) => {
                byType[stat.comment_type] = stat.count;
                totalComments += stat.count;
            });

            const data: BookCommentSummary = {
                bookId,
                totalComments,
                byType
            };
            return { success: true, data };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }
}
