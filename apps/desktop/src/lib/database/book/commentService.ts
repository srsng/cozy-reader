import { getDatabase } from './config';
import type {
    Comment,
    CommentType,
    CreateCommentInput,
    UpdateCommentInput,
    CommentQueryOptions,
    CommentStatistics,
    BookCommentSummary,
    PositionInfo
} from './comment';
import type { DatabaseResult } from '../types';
import { DatabaseUtils } from '../utils';

/**
 * 评论数据库服务类
 */
export class CommentService {
    /**
     * 创建新评论
     */
    static async createComment(input: CreateCommentInput): Promise<DatabaseResult<Comment>> {
        return await DatabaseUtils.safeExecute(async () => {
            DatabaseUtils.validateRequiredFields(input, ['book_id', 'content']);

            const db = await getDatabase();

            const positionJson = input.position_info ? JSON.stringify(input.position_info) : null;
            const tagsJson = JSON.stringify(input.tags || []);

            const result = await db.execute(
                `INSERT INTO comments (
					book_id, content, comment_type, position_info, selected_text, 
					color, tags, is_private
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    input.book_id,
                    input.content,
                    input.comment_type || 'note',
                    positionJson,
                    input.selected_text || null,
                    input.color || '#ffeb3b',
                    tagsJson,
                    input.is_private !== undefined ? input.is_private : true
                ]
            );

            const commentId = result.lastInsertId as number;
            return await this.getCommentById(commentId);
        }, 'Failed to create comment');
    }

    /**
     * 根据ID获取评论
     */
    static async getCommentById(id: number): Promise<Comment> {
        const db = await getDatabase();
        const result = await db.select<Comment[]>('SELECT * FROM comments WHERE id = ?', [id]);

        if (result.length === 0) {
            throw new Error(`Comment with id ${id} not found`);
        }

        return result[0];
    }

    /**
     * 查询评论列表
     */
    static async getComments(
        options: CommentQueryOptions = {}
    ): Promise<DatabaseResult<Comment[]>> {
        return await DatabaseUtils.safeExecute(async () => {
            const db = await getDatabase();

            let query = 'SELECT * FROM comments';
            const params: any[] = [];
            const conditions: string[] = [];

            // 书籍ID筛选
            if (options.book_id) {
                conditions.push('book_id = ?');
                params.push(options.book_id);
            }

            // 评论类型筛选
            if (options.comment_type) {
                conditions.push('comment_type = ?');
                params.push(options.comment_type);
            }

            // 搜索条件
            if (options.search) {
                conditions.push('(content LIKE ? OR selected_text LIKE ?)');
                const searchTerm = `%${DatabaseUtils.escapeLikeQuery(options.search)}%`;
                params.push(searchTerm, searchTerm);
            }

            // 标签筛选
            if (options.tags && options.tags.length > 0) {
                const tagConditions = options.tags.map(() => 'tags LIKE ?').join(' OR ');
                conditions.push(`(${tagConditions})`);
                options.tags.forEach((tag) => {
                    params.push(`%"${tag}"%`);
                });
            }

            // 私有性筛选
            if (options.is_private !== undefined) {
                conditions.push('is_private = ?');
                params.push(options.is_private);
            }

            // 添加WHERE子句
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            // 排序
            const sortBy = options.sort_by || 'created_at';
            const sortOrder = options.sort_order || 'desc';
            query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

            // 分页
            const { clause: limitClause, params: limitParams } = DatabaseUtils.buildLimitClause(
                options.limit,
                options.offset
            );
            query += limitClause;
            params.push(...limitParams);

            return await db.select<Comment[]>(query, params);
        }, 'Failed to get comments');
    }

    /**
     * 更新评论
     */
    static async updateComment(
        id: number,
        input: UpdateCommentInput
    ): Promise<DatabaseResult<Comment>> {
        return await DatabaseUtils.safeExecute(async () => {
            const db = await getDatabase();

            const updates: string[] = [];
            const params: any[] = [];

            if (input.content !== undefined) {
                updates.push('content = ?');
                params.push(input.content);
            }

            if (input.comment_type !== undefined) {
                updates.push('comment_type = ?');
                params.push(input.comment_type);
            }

            if (input.position_info !== undefined) {
                updates.push('position_info = ?');
                params.push(input.position_info ? JSON.stringify(input.position_info) : null);
            }

            if (input.selected_text !== undefined) {
                updates.push('selected_text = ?');
                params.push(input.selected_text);
            }

            if (input.color !== undefined) {
                updates.push('color = ?');
                params.push(input.color);
            }

            if (input.tags !== undefined) {
                updates.push('tags = ?');
                params.push(JSON.stringify(input.tags));
            }

            if (input.is_private !== undefined) {
                updates.push('is_private = ?');
                params.push(input.is_private);
            }

            if (updates.length === 0) {
                throw new Error('No fields to update');
            }

            params.push(id);

            const result = await db.execute(
                `UPDATE comments SET ${updates.join(', ')} WHERE id = ?`,
                params
            );

            if (result.rowsAffected === 0) {
                throw new Error(`Comment with id ${id} not found`);
            }

            return await this.getCommentById(id);
        }, 'Failed to update comment');
    }

    /**
     * 删除评论
     */
    static async deleteComment(id: number): Promise<DatabaseResult<void>> {
        return await DatabaseUtils.safeExecute(async () => {
            const db = await getDatabase();

            const result = await db.execute('DELETE FROM comments WHERE id = ?', [id]);

            if (result.rowsAffected === 0) {
                throw new Error(`Comment with id ${id} not found`);
            }
        }, 'Failed to delete comment');
    }

    /**
     * 获取书籍的所有评论
     */
    static async getCommentsByBookId(
        bookId: number,
        options: Omit<CommentQueryOptions, 'book_id'> = {}
    ): Promise<DatabaseResult<Comment[]>> {
        return await this.getComments({ ...options, book_id: bookId });
    }

    /**
     * 获取评论总数
     */
    static async getCommentCount(
        options: Omit<CommentQueryOptions, 'sort_by' | 'sort_order' | 'offset' | 'limit'> = {}
    ): Promise<DatabaseResult<number>> {
        return await DatabaseUtils.safeExecute(async () => {
            const db = await getDatabase();

            let query = 'SELECT COUNT(*) as count FROM comments';
            const params: any[] = [];
            const conditions: string[] = [];

            // 应用相同的筛选条件
            if (options.book_id) {
                conditions.push('book_id = ?');
                params.push(options.book_id);
            }

            if (options.comment_type) {
                conditions.push('comment_type = ?');
                params.push(options.comment_type);
            }

            if (options.search) {
                conditions.push('(content LIKE ? OR selected_text LIKE ?)');
                const searchTerm = `%${DatabaseUtils.escapeLikeQuery(options.search)}%`;
                params.push(searchTerm, searchTerm);
            }

            if (options.tags && options.tags.length > 0) {
                const tagConditions = options.tags.map(() => 'tags LIKE ?').join(' OR ');
                conditions.push(`(${tagConditions})`);
                options.tags.forEach((tag) => {
                    params.push(`%"${tag}"%`);
                });
            }

            if (options.is_private !== undefined) {
                conditions.push('is_private = ?');
                params.push(options.is_private);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            const result = await db.select<{ count: number }[]>(query, params);
            return result[0].count;
        }, 'Failed to get comment count');
    }

    /**
     * 获取评论统计信息
     */
    static async getCommentStatistics(): Promise<DatabaseResult<CommentStatistics>> {
        return await DatabaseUtils.safeExecute(async () => {
            const db = await getDatabase();

            // 获取总评论数
            const totalResult = await this.getCommentCount();
            const totalComments = totalResult.success ? totalResult.data! : 0;

            // 获取各类型评论数量
            const typeStats = await db.select<{ comment_type: CommentType; count: number }[]>(
                'SELECT comment_type, COUNT(*) as count FROM comments GROUP BY comment_type'
            );

            const commentsByType: Record<CommentType, number> = {
                note: 0,
                highlight: 0,
                bookmark: 0,
                review: 0
            };

            typeStats.forEach((stat) => {
                commentsByType[stat.comment_type] = stat.count;
            });

            // 获取最近7天的评论数
            const recentResult = await db.select<{ count: number }[]>(
                `SELECT COUNT(*) as count FROM comments 
				 WHERE created_at >= datetime('now', '-7 days')`
            );
            const recentCommentsCount = recentResult[0].count;

            // 计算平均每本书的评论数
            const bookCountResult = await db.select<{ count: number }[]>(
                'SELECT COUNT(DISTINCT book_id) as count FROM comments'
            );
            const uniqueBookCount = bookCountResult[0].count;
            const averageCommentsPerBook =
                uniqueBookCount > 0 ? totalComments / uniqueBookCount : 0;

            return {
                total_comments: totalComments,
                comments_by_type: commentsByType,
                recent_comments_count: recentCommentsCount,
                average_comments_per_book: Math.round(averageCommentsPerBook * 100) / 100
            };
        }, 'Failed to get comment statistics');
    }

    /**
     * 获取书籍评论摘要
     */
    static async getBookCommentSummaries(): Promise<DatabaseResult<BookCommentSummary[]>> {
        return await DatabaseUtils.safeExecute(async () => {
            const db = await getDatabase();

            const result = await db.select<
                {
                    book_id: number;
                    book_title: string;
                    total_comments: number;
                    comment_type: CommentType;
                    type_count: number;
                    last_comment_at: string;
                }[]
            >(`
				SELECT 
					c.book_id,
					b.title as book_title,
					COUNT(*) as total_comments,
					c.comment_type,
					COUNT(c.comment_type) as type_count,
					MAX(c.created_at) as last_comment_at
				FROM comments c
				JOIN books b ON c.book_id = b.id
				GROUP BY c.book_id, c.comment_type
				ORDER BY c.book_id, c.comment_type
			`);

            // 组织数据结构
            const summaryMap = new Map<number, BookCommentSummary>();

            result.forEach((row) => {
                if (!summaryMap.has(row.book_id)) {
                    summaryMap.set(row.book_id, {
                        book_id: row.book_id,
                        book_title: row.book_title,
                        total_comments: 0,
                        comments_by_type: {
                            note: 0,
                            highlight: 0,
                            bookmark: 0,
                            review: 0
                        },
                        last_comment_at: row.last_comment_at
                    });
                }

                const summary = summaryMap.get(row.book_id)!;
                summary.comments_by_type[row.comment_type] = row.type_count;
                summary.total_comments += row.type_count;

                // 更新最新评论时间
                if (!summary.last_comment_at || row.last_comment_at > summary.last_comment_at) {
                    summary.last_comment_at = row.last_comment_at;
                }
            });

            return Array.from(summaryMap.values());
        }, 'Failed to get book comment summaries');
    }

    /**
     * 批量删除书籍的所有评论
     */
    static async deleteCommentsByBookId(bookId: number): Promise<DatabaseResult<number>> {
        return await DatabaseUtils.safeExecute(async () => {
            const db = await getDatabase();

            const result = await db.execute('DELETE FROM comments WHERE book_id = ?', [bookId]);
            return result.rowsAffected || 0;
        }, 'Failed to delete comments by book ID');
    }
}
