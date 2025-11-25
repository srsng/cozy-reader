import { getDatabase } from './config';
import type {
    Book,
    BookStatus,
    CreateBookInput,
    UpdateBookInput,
    BookQueryOptions,
    BookStatistics,
    ReadingProgress
} from './book';
import type { DatabaseResult } from '../types';
import { softDelete, buildSoftDeleteCondition } from '../utils/softDelete';
import { DB_ENUM } from '../const';
import { BookDbUtils } from '.';

/**
 * 书籍数据库服务类
 */
export class BookService {
    /**
     * 获取所有书籍
     */
    static async getAllBooks(): Promise<DatabaseResult<Book[]>> {
        return await BookDbUtils.safeExecute(
            async () => await this.getBooks(),
            'Failed to get all books',
        );
    }

    /**
     * 创建新书籍
     */
    static async createBook(input: CreateBookInput): Promise<DatabaseResult<Book>> {
        return await BookDbUtils.safeExecute(
            async () => {
                const db = await getDatabase();

                const tagsJson = JSON.stringify(input.tags || []);
                const progressJson = input.current_progress || '{}';

                const result = await db.execute(
                    `INSERT INTO books (
						path, title, author, format, cover, storage_type, current_progress, 
						total_characters, file_size, tags, rating, notes
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        input.path,
                        input.title,
                        input.author || null,
                        input.format,
                        input.cover || null,
                        input.storage_type,
                        progressJson,
                        input.total_characters || 0,
                        input.file_size || 0,
                        tagsJson,
                        input.rating || null,
                        input.notes || null
                    ]
                );

                const bookId = result.lastInsertId as number;
                return await this.getBookById(bookId);
            },
            'Failed to create book',
        );
    }

    /**
     * 根据 ID 获取书籍
     */
    static async getBookById(id: number): Promise<Book> {
        const db = await getDatabase();

        const softDeleteCondition = buildSoftDeleteCondition();
        const result = await db.select<Book[]>(
            `SELECT * FROM books WHERE id = ? AND ${softDeleteCondition}`,
            [id]
        );

        if (result.length === 0) {
            throw new Error(`Book with id ${id} not found`);
        }

        return result[0];
    }

    /**
     * 根据路径获取书籍
     */
    static async getBookByPath(path: string): Promise<Book | null> {
        const db = await getDatabase();

        const softDeleteCondition = buildSoftDeleteCondition();
        const result = await db.select<Book[]>(
            `SELECT * FROM books WHERE path = ? AND ${softDeleteCondition}`,
            [path]
        );

        return result.length > 0 ? result[0] : null;
    }

    /**
     * 查询书籍列表
     */
    static async getBooks(options: BookQueryOptions = {}): Promise<Book[]> {
        const db = await getDatabase();

        const softDeleteCondition = buildSoftDeleteCondition();
        let query = `SELECT * FROM books WHERE ${softDeleteCondition}`;
        const params: any[] = [];
        const conditions: string[] = [];

        // 搜索条件
        if (options.search) {
            conditions.push('(title LIKE ? OR author LIKE ?)');
            const searchTerm = `%${options.search}%`;
            params.push(searchTerm, searchTerm);
        }

        // 状态筛选
        if (options.status) {
            conditions.push('status = ?');
            params.push(options.status);
        }

        // 标签筛选
        if (options.tags && options.tags.length > 0) {
            const tagConditions = options.tags.map(() => 'tags LIKE ?').join(' OR ');
            conditions.push(`(${tagConditions})`);
            options.tags.forEach((tag) => {
                params.push(`%"${tag}"%`);
            });
        }

        // 添加其他条件
        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

        // 排序 - 使用白名单验证防止 SQL 注入
        const allowedSortFields = ['title', 'author', 'added_at', 'last_read_at', 'rating'] as const;
        const sortBy = options.sort_by && allowedSortFields.includes(options.sort_by as typeof allowedSortFields[number])
            ? options.sort_by
            : 'added_at';
        const sortOrder = options.sort_order === 'asc' ? 'ASC' : 'DESC';
        query += ` ORDER BY ${sortBy} ${sortOrder}`;

        // 分页
        if (options.limit) {
            query += ' LIMIT ?';
            params.push(options.limit);

            if (options.offset) {
                query += ' OFFSET ?';
                params.push(options.offset);
            }
        }

        return await db.select<Book[]>(query, params);
    }

    /**
     * 更新书籍信息
     */
    static async updateBook(id: number, input: UpdateBookInput): Promise<Book> {
        const db = await getDatabase();

        const updates: string[] = [];
        const params: any[] = [];

        if (input.title !== undefined) {
            updates.push('title = ?');
            params.push(input.title);
        }

        if (input.author !== undefined) {
            updates.push('author = ?');
            params.push(input.author);
        }

        if (input.current_progress !== undefined) {
            updates.push('current_progress = ?');
            params.push(input.current_progress);
        }

        if (input.read_characters !== undefined) {
            updates.push('read_characters = ?');
            params.push(input.read_characters);
        }

        if (input.reading_time_minutes !== undefined) {
            updates.push('reading_time_minutes = ?');
            params.push(input.reading_time_minutes);
        }

        if (input.status !== undefined) {
            updates.push('status = ?');
            params.push(input.status);
        }

        if (input.tags !== undefined) {
            updates.push('tags = ?');
            params.push(JSON.stringify(input.tags));
        }

        if (input.rating !== undefined) {
            updates.push('rating = ?');
            params.push(input.rating);
        }

        if (input.notes !== undefined) {
            updates.push('notes = ?');
            params.push(input.notes);
        }

        if (input.cover !== undefined) {
            updates.push('cover = ?');
            params.push(input.cover);
        }

        if (input.format !== undefined) {
            updates.push('format = ?');
            params.push(input.format);
        }

        if (input.storage_type !== undefined) {
            updates.push('storage_type = ?');
            params.push(input.storage_type);
        }

        if (updates.length === 0) {
            throw new Error('No fields to update');
        }

        // 更新最后阅读时间
        updates.push("last_read_at = strftime('%s', 'now')");

        params.push(id);

        const softDeleteCondition = buildSoftDeleteCondition();
        await db.execute(
            `UPDATE books SET ${updates.join(', ')} WHERE id = ? AND ${softDeleteCondition}`,
            params
        );

        return await this.getBookById(id);
    }

    /**
     * 更新阅读进度
     */
    static async updateReadingProgress(
        id: number,
        progress: ReadingProgress,
        readCharacters?: number
    ): Promise<Book> {
        const progressJson = JSON.stringify(progress);

        const updateData: UpdateBookInput = {
            current_progress: progressJson
        };

        if (readCharacters !== undefined) {
            updateData.read_characters = readCharacters;

            // 如果有阅读字符数，自动更新状态为阅读中
            if (readCharacters > 0) {
                updateData.status = 'reading' as BookStatus;
            }
        }

        return await this.updateBook(id, updateData);
    }

    /**
     * 删除书籍
     */
    static async deleteBook(id: number): Promise<DatabaseResult<void>> {
        return await BookDbUtils.safeExecute(
            async () => {
                const success = await softDelete(DB_ENUM.books, 'books', id);
                if (!success) {
                    throw new Error(`Book with id ${id} not found`);
                }
                return undefined;
            },
            'Failed to delete book',
        );
    }

    /**
     * 获取书籍统计信息
     */
    static async getBookStatistics(id: number): Promise<BookStatistics> {
        const book = await this.getBookById(id);

        const totalReadingTime = book.reading_time_minutes;
        const progressPercentage =
            book.total_characters > 0 ? (book.read_characters / book.total_characters) * 100 : 0;

        const averageReadingSpeed =
            totalReadingTime > 0 ? book.read_characters / totalReadingTime : 0;

        const remainingCharacters = book.total_characters - book.read_characters;
        const estimatedRemainingTime =
            averageReadingSpeed > 0 ? remainingCharacters / averageReadingSpeed : 0;

        return {
            total_reading_time: totalReadingTime,
            average_reading_speed: averageReadingSpeed,
            progress_percentage: Math.round(progressPercentage * 100) / 100,
            estimated_remaining_time: Math.round(estimatedRemainingTime)
        };
    }

    /**
     * 获取书籍总数
     */
    static async getBookCount(
        options: Omit<BookQueryOptions, 'sort_by' | 'sort_order' | 'offset' | 'limit'> = {}
    ): Promise<number> {
        const db = await getDatabase();

        const softDeleteCondition = buildSoftDeleteCondition();
        let query = `SELECT COUNT(*) as count FROM books WHERE ${softDeleteCondition}`;
        const params: any[] = [];
        const conditions: string[] = [];

        // 搜索条件
        if (options.search) {
            conditions.push('(title LIKE ? OR author LIKE ?)');
            const searchTerm = `%${options.search}%`;
            params.push(searchTerm, searchTerm);
        }

        // 状态筛选
        if (options.status) {
            conditions.push('status = ?');
            params.push(options.status);
        }

        // 标签筛选
        if (options.tags && options.tags.length > 0) {
            const tagConditions = options.tags.map(() => 'tags LIKE ?').join(' OR ');
            conditions.push(`(${tagConditions})`);
            options.tags.forEach((tag) => {
                params.push(`%"${tag}"%`);
            });
        }

        // 添加其他条件
        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

        const result = await db.select<{ count: number }[]>(query, params);
        return result[0].count;
    }

    /**
     * 检查书籍是否存在
     */
    static async bookExists(path: string): Promise<boolean> {
        const book = await this.getBookByPath(path);
        return book !== null;
    }

    /**
     * 获取最近阅读的书籍
     */
    static async getRecentBooks(limit: number = 10): Promise<Book[]> {
        return await this.getBooks({
            sort_by: 'last_read_at',
            sort_order: 'desc',
            limit
        });
    }

    /**
     * 获取所有标签
     */
    static async getAllTags(): Promise<string[]> {
        const db = await getDatabase();

        const softDeleteCondition = buildSoftDeleteCondition();
        const result = await db.select<{ tags: string }[]>(
            `SELECT DISTINCT tags FROM books WHERE tags != "[]" AND ${softDeleteCondition}`
        );

        const allTags = new Set<string>();

        result.forEach((row: { tags: string }) => {
            try {
                const tags = JSON.parse(row.tags) as string[];
                tags.forEach((tag) => allTags.add(tag));
            } catch (e) {
                // 忽略解析错误
            }
        });

        return Array.from(allTags).sort();
    }
}
