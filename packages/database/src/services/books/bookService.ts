// 类型导入
import type { Book, NewBook, BookUpdate, BookQueryOptions, BookStatistics, ReadingProgress } from '../../core/types/books';
import type { DatabaseResult } from '../../core/types';

// 值导入
import { DatabaseError } from '../../core/errors';
import { isSuccessResult } from '../../core/types';
import { executeSelect } from '../../core/execution';
import { BOOKS_DEFAULTS } from '../../../drizzle/books/schema-defaults';
import { booksAllowedUpdateFields } from '../../../drizzle/books/schema';
import { buildSearchCondition, buildTagFilterCondition, escapeLikeQuery } from '../../core/query';
import { serializeJSON } from '../../core/serialization';
import { logDatabaseWarn } from '../../core/logging';

// 基类导入
import { BaseService } from '../BaseService';

// 本地工具导入
import { isSupportFormat, getFileFormat, extractTitleFromPath } from './bookFormat';

/**
 * 书籍服务
 * 继承基础服务类，提供书籍相关的 CRUD 操作（单例模式）
 */
export class BookService extends BaseService<Book, NewBook, BookUpdate, BookQueryOptions> {
    private static instance: BookService;

    /**
     * 私有构造函数
     */
    private constructor() {
        super({
            databaseName: 'books',
            tableName: 'books',
            defaultSortField: 'added_at',
            sortFieldMap: {
                'title': 'title',
                'author': 'author',
                'addedAt': 'added_at',
                'lastReadAt': 'last_read_at',
                'rating': 'rating'
            },
            allowedUpdateFields: booksAllowedUpdateFields,
            jsonFields: [
                { fieldName: 'current_progress', defaultValue: BOOKS_DEFAULTS.currentProgress, nullable: false },
                { fieldName: 'tags', defaultValue: BOOKS_DEFAULTS.tags, nullable: false },
                { fieldName: 'reader_settings', defaultValue: {}, nullable: true }
            ]
        });
    }

    /**
     * 获取单例实例
     */
    static getInstance(): BookService {
        if (!BookService.instance) {
            BookService.instance = new BookService();
        }
        return BookService.instance;
    }

    // ===== 静态方法包装（简化调用）=====

    /**
     * 根据 ID 获取书籍（静态方法）
     * @param id 书籍 ID
     * @param includeDeleted 是否包含已删除记录，默认 false
     * @returns 书籍记录
     */
    static async getById(id: number, includeDeleted: boolean = false): Promise<DatabaseResult<Book>> {
        return BookService.getInstance().getById(id, includeDeleted);
    }

    /**
     * 创建书籍（静态方法）
     * @param input 新书籍数据
     * @returns 创建的书籍记录
     */
    static async create(input: NewBook): Promise<DatabaseResult<Book>> {
        return BookService.getInstance().create(input);
    }

    /**
     * 更新书籍（静态方法）
     * @param id 书籍 ID
     * @param input 更新数据
     * @returns 更新后的书籍记录
     */
    static async update(id: number, input: BookUpdate): Promise<DatabaseResult<Book>> {
        return BookService.getInstance().update(id, input);
    }

    /**
     * 列表查询书籍（静态方法）
     * @param options 查询选项
     * @param includeDeleted 是否包含已删除记录，默认 false
     * @returns 书籍列表
     */
    static async list(options?: BookQueryOptions, includeDeleted: boolean = false): Promise<DatabaseResult<Book[]>> {
        return BookService.getInstance().list(options, includeDeleted);
    }

    /**
     * 获取书籍总数（静态方法）
     * @param options 查询选项
     * @param includeDeleted 是否包含已删除记录，默认 false
     * @returns 总数
     */
    static async getCount(options?: BookQueryOptions, includeDeleted: boolean = false): Promise<DatabaseResult<number>> {
        return BookService.getInstance().getCount(options, includeDeleted);
    }

    /**
     * 软删除书籍（静态方法）
     * @param id 书籍 ID
     */
    static async softDelete(id: number): Promise<DatabaseResult<void>> {
        return BookService.getInstance().softDelete(id);
    }

    /**
     * 硬删除书籍（静态方法）
     * @param id 书籍 ID
     */
    static async hardDelete(id: number): Promise<DatabaseResult<void>> {
        return BookService.getInstance().hardDelete(id);
    }

    /**
     * 恢复已删除的书籍（静态方法）
     * @param id 书籍 ID
     * @returns 恢复后的书籍记录
     */
    static async restore(id: number): Promise<DatabaseResult<Book>> {
        return BookService.getInstance().restore(id);
    }

    /**
     * 根据路径获取书籍（静态方法）
     * @param path 书籍路径
     * @returns 书籍记录或 null
     */
    static async getByPath(path: string): Promise<DatabaseResult<Book | null>> {
        return BookService.getInstance().getByPath(path);
    }

    // /**
    //  * 更新阅读进度（静态方法）
    //  * @param id 书籍 ID
    //  * @param progress 阅读进度
    //  * @param readCharacters 已读字符数（可选）
    //  * @returns 更新后的书籍记录
    //  */
    // static async updateReadingProgress(
    //     id: number,
    //     progress: ReadingProgress,
    //     readCharacters?: number
    // ): Promise<DatabaseResult<Book>> {
    //     return BookService.getInstance().updateReadingProgress(id, progress, readCharacters);
    // }

    /**
     * 获取书籍统计信息（静态方法）
     * @param id 书籍 ID
     * @returns 书籍统计信息
     */
    static async getStatistics(id: number): Promise<DatabaseResult<BookStatistics>> {
        return BookService.getInstance().getStatistics(id);
    }

    /**
     * 检查书籍是否存在（静态方法）
     * @param path 书籍路径
     * @returns 是否存在
     */
    static async exists(path: string): Promise<DatabaseResult<boolean>> {
        return BookService.getInstance().exists(path);
    }

    /**
     * 获取最近阅读的书籍（静态方法）
     * @param limit 返回数量限制，默认 10
     * @returns 书籍列表
     */
    static async getRecent(limit: number = 10): Promise<DatabaseResult<Book[]>> {
        return BookService.getInstance().getRecent(limit);
    }

    /**
     * 获取所有标签（静态方法）
     * @returns 所有唯一标签的排序数组
     */
    static async getAllTags(): Promise<DatabaseResult<string[]>> {
        return BookService.getInstance().getAllTags();
    }

    /**
     * 查询包含任意指定标签的书籍（静态方法）
     * @param tags 标签名称数组
     * @returns 书籍 ID 数组
     */
    static async findBooksByTags(tags: string[]): Promise<DatabaseResult<number[]>> {
        return BookService.getInstance().findBooksByTags(tags);
    }

    /**
     * 从文件系统路径添加书籍（静态方法）
     * @param path 文件路径
     * @returns 创建的书籍或已存在的书籍（错误结果中携带）
     */
    static async addBookByFsPath(path: string): Promise<DatabaseResult<Book>> {
        return BookService.getInstance().addBookByFsPath(path);
    }

    /**
     * 构建筛选条件
     */
    protected buildFilterConditions(
        options: BookQueryOptions | undefined,
        conditions: string[],
        params: unknown[]
    ): void {
        // 搜索条件
        if (options?.search) {
            const searchCondition = buildSearchCondition(options.search, ['title', 'author'], escapeLikeQuery);
            if (searchCondition.condition) {
                conditions.push(searchCondition.condition);
                params.push(...searchCondition.params);
            }
        }

        // 状态筛选
        if (options?.status) {
            conditions.push('status = ?');
            params.push(options.status);
        }

        // 标签筛选
        if (options?.tags && options.tags.length > 0) {
            const tagCondition = buildTagFilterCondition(options.tags);
            if (tagCondition.condition) {
                conditions.push(tagCondition.condition);
                params.push(...tagCondition.params);
            }
        }
    }

    /**
     * 构建插入字段和值
     */
    protected buildInsertFields(input: NewBook): {
        fields: string[];
        values: unknown[];
    } {
        const tags = input.tags || BOOKS_DEFAULTS.tags;
        const progress = input.currentProgress || BOOKS_DEFAULTS.currentProgress;

        return {
            fields: [
                'path',
                'title',
                'author',
                'format',
                'cover',
                'storage_type',
                'current_progress',
                'total_characters',
                'read_characters',
                'reading_time',
                'file_size',
                'status',
                'tags',
                'rating',
                'notes',
                'added_at'
            ],
            values: [
                input.path,
                input.title,
                input.author || null,
                input.format,
                input.cover || null,
                input.storageType,
                serializeJSON(progress),
                input.totalCharacters ?? BOOKS_DEFAULTS.totalCharacters,
                input.readCharacters ?? BOOKS_DEFAULTS.readCharacters,
                input.readingTime ?? BOOKS_DEFAULTS.readingTime,
                input.fileSize ?? BOOKS_DEFAULTS.fileSize,
                input.status || BOOKS_DEFAULTS.status,
                serializeJSON(tags),
                input.rating || null,
                input.notes || null,
                input.addedAt || Math.floor(Date.now() / 1000),
            ]
        };
    }

    /**
     * 构建更新字段
     */
    protected buildUpdateFields(input: BookUpdate, updates: string[], params: unknown[]): void {
        if (input.title !== undefined) {
            updates.push('title = ?');
            params.push(input.title);
        }
        if (input.author !== undefined) {
            updates.push('author = ?');
            params.push(input.author);
        }
        if (input.status !== undefined) {
            updates.push('status = ?');
            params.push(input.status);
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
        if (input.tags !== undefined) {
            updates.push('tags = ?');
            params.push(serializeJSON(input.tags));
        }
        if (input.currentProgress !== undefined) {
            updates.push('current_progress = ?');
            params.push(serializeJSON(input.currentProgress));
        }
        if (input.readerSettings !== undefined) {
            updates.push('reader_settings = ?');
            params.push(serializeJSON(input.readerSettings));
        }
        if (input.readCharacters !== undefined) {
            updates.push('read_characters = ?');
            params.push(input.readCharacters);
        }
        if (input.readingTime !== undefined) {
            updates.push('reading_time = ?');
            params.push(input.readingTime);
        }
        if (input.fileSize !== undefined) {
            updates.push('file_size = ?');
            params.push(input.fileSize);
        }
        if (input.lastReadAt !== undefined) {
            updates.push('last_read_at = ?');
            params.push(input.lastReadAt);
        }
    }

    // ===== 查询方法组 =====

    /**
     * 根据路径获取书籍
     * @param path 书籍路径
     * @returns 书籍记录或 null
     */
    async getByPath(path: string): Promise<DatabaseResult<Book | null>> {
        try {
            const db = await BaseService.getDatabase(this.config.databaseName);
            const softDeleteCondition = this.buildSoftDeleteWhere(false);

            const result = await executeSelect<Record<string, unknown>[]>(
                db,
                this.config.databaseName,
                `SELECT * FROM ${this.config.tableName} WHERE path = ? AND ${softDeleteCondition}`,
                [path],
                {
                    operationName: 'BookService.getByPath'
                }
            );

            if (result.length === 0) {
                return { success: true, data: null };
            }

            const data = this.deserializeRecordJsonFields(result[0]);
            return { success: true, data };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    /**
     * 获取最近阅读的书籍
     * @param limit 返回数量限制，默认 10
     * @returns 书籍列表
     */
    async getRecent(limit: number = 10): Promise<DatabaseResult<Book[]>> {
        try {
            return await super.list({
                sortBy: 'lastReadAt',
                sortOrder: 'desc',
                limit
            });
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    /**
     * 获取所有标签（使用 JSON1 扩展提取）
     * @returns 所有唯一标签的排序数组
     */
    async getAllTags(): Promise<DatabaseResult<string[]>> {
        try {
            const db = await BaseService.getDatabase(this.config.databaseName);
            const softDeleteCondition = this.buildSoftDeleteWhere(false);

            // 使用 JSON1 扩展的 json_each 函数提取所有标签
            const result = await executeSelect<{ value: string }[]>(
                db,
                this.config.databaseName,
                `SELECT DISTINCT json_each.value as value 
                 FROM ${this.config.tableName} t, json_each(t.tags) 
                 WHERE ${softDeleteCondition} AND json_valid(t.tags) = 1`,
                [],
                {
                    operationName: 'BookService.getAllTags'
                }
            );

            const allTags = new Set<string>();

            result.forEach((row) => {
                try {
                    // 确保值是字符串类型
                    if (typeof row.value === 'string' && row.value.trim().length > 0) {
                        allTags.add(row.value);
                    } else if (row.value !== null && row.value !== undefined) {
                        // 如果不是字符串，尝试转换为字符串（处理可能的类型不一致）
                        const stringValue = String(row.value).trim();
                        if (stringValue.length > 0) {
                            allTags.add(stringValue);
                        }
                    }
                } catch (error) {
                    // 记录错误但继续处理其他标签
                    logDatabaseWarn('Invalid tag value in getAllTags:', row.value, error);
                }
            });

            return { success: true, data: Array.from(allTags).sort() };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    /**
     * 查询包含任意指定标签的书籍（使用 JSON1 扩展进行精确匹配）
     * @param tags 标签名称数组
     * @returns 书籍 ID 数组
     */
    async findBooksByTags(tags: string[]): Promise<DatabaseResult<number[]>> {
        if (tags.length === 0) {
            return { success: true, data: [] };
        }

        try {
            const db = await BaseService.getDatabase(this.config.databaseName);
            const softDeleteCondition = this.buildSoftDeleteWhere(false);

            // 使用 JSON1 扩展的 json_each 函数进行精确匹配
            const conditions = tags.map(() =>
                `EXISTS (SELECT 1 FROM json_each(tags) WHERE json_each.value = ?)`
            ).join(' OR ');
            const params = tags;

            const result = await executeSelect<{ id: number }[]>(
                db,
                this.config.databaseName,
                `SELECT DISTINCT id FROM ${this.config.tableName} 
                 WHERE (${conditions}) AND ${softDeleteCondition}`,
                params,
                {
                    operationName: 'BookService.findBooksByTags'
                }
            );

            return { success: true, data: result.map(r => r.id) };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    // ===== 统计方法组 =====

    /**
     * 获取书籍统计信息
     * @param id 书籍 ID
     * @returns 书籍统计信息
     */
    async getStatistics(id: number): Promise<DatabaseResult<BookStatistics>> {
        try {
            const bookResult = await this.getById(id);
            if (!isSuccessResult(bookResult)) {
                return {
                    success: false,
                    error: bookResult.error,
                    code: bookResult.code,
                    cause: bookResult.cause
                };
            }
            const book = bookResult.data;

            const totalReadingTime = book.readingTime; // 单位：秒
            const progressPercentage =
                book.totalCharacters > 0 ? (book.readCharacters / book.totalCharacters) * 100 : 0;

            const averageReadingSpeed =
                totalReadingTime > 0 ? book.readCharacters / totalReadingTime : 0;

            const remainingCharacters = book.totalCharacters - book.readCharacters;
            const estimatedRemainingTime =
                averageReadingSpeed > 0 ? remainingCharacters / averageReadingSpeed : 0;

            const data: BookStatistics = {
                totalReadingTime,
                averageReadingSpeed,
                progressPercentage: Math.round(progressPercentage * 100) / 100,
                estimatedRemainingTime: Math.round(estimatedRemainingTime)
            };
            return { success: true, data };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    // ===== 工具方法组 =====

    /**
     * 从文件系统路径添加书籍
     * @param path 文件路径
     * @returns 创建的书籍或已存在的书籍（错误结果中携带）
     */
    async addBookByFsPath(path: string): Promise<DatabaseResult<Book>> {
        try {
            // 检查文件格式是否支持
            if (!isSupportFormat(path)) {
                throw new DatabaseError(
                    `不支持的文件类型: ${path}`,
                    'UNSUPPORTED_FILE_FORMAT'
                );
            }

            // 检查书籍是否已存在
            const existingBookResult = await this.getByPath(path);
            if (existingBookResult.success && existingBookResult.data) {
                return {
                    success: false,
                    data: existingBookResult.data,
                    error: `[books] 书籍 ${existingBookResult.data.title} 已存在`,
                    code: 'BOOK_ALREADY_EXISTS'
                };
            }

            // 从文件路径提取标题
            const title = extractTitleFromPath(path);
            const format = getFileFormat(path);

            // 创建新书籍
            return await this.create({
                path: path,
                title: title,
                author: null,
                format: format,
                storageType: 'filesystem',
            });
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    /**
     * 检查书籍是否存在
     * @param path 书籍路径
     * @returns 是否存在
     */
    async exists(path: string): Promise<DatabaseResult<boolean>> {
        try {
            const bookResult = await this.getByPath(path);
            return { success: true, data: bookResult.success && bookResult.data !== null };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    // /**
    //  * 更新阅读进度
    //  * 
    //  * 注意：如果需要同时创建或更新阅读会话，建议使用事务包装多个操作
    //  * 以确保数据一致性（参考 Transaction 类）
    //  * @param id 书籍 ID
    //  * @param progress 阅读进度
    //  * @param readCharacters 已读字符数（可选）
    //  * @returns 更新后的书籍记录
    //  */
    // async updateReadingProgress(
    //     id: number,
    //     progress: ReadingProgress,
    //     readCharacters?: number
    // ): Promise<DatabaseResult<Book>> {
    //     try {
    //         const updateData: BookUpdate = {
    //             currentProgress: progress
    //         };

    //         if (readCharacters !== undefined) {
    //             updateData.readCharacters = readCharacters;

    //             // 如果有阅读字符数，自动更新状态为阅读中
    //             if (readCharacters > 0) {
    //                 updateData.status = 'reading';
    //             }
    //         }

    //         return await super.update(id, updateData);
    //     } catch (error) {
    //         return BaseService.handleError(error, this.config.databaseName);
    //     }
    // }
}
