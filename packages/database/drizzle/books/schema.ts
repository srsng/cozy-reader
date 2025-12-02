import { sqliteTable, integer, text, real, index, check } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { generateAllowedUpdateFields } from '../schema-utils';


export type BookStatus = 'not_started' | 'reading' | 'completed' | 'paused'; // 注意与status_check同步修改
export type CommentType = 'note' | 'highlight' | 'underline' | 'strike' | 'bookmark' | 'review';  // 注意与comment_type_check同步修改
export type StorageType = 'filesystem' | 'localstorage' | 'cloud' | 'database'; // 注意与storage_type_check同步修改

// 枚举类型定义
export const bookStatusEnum = ['not_started', 'reading', 'completed', 'paused'] as const; // 注意与status_check同步修改
export const commentTypeEnum = ['note', 'highlight', 'underline', 'strike', 'bookmark', 'review'] as const; // 注意与comment_type_check同步修改
export const storageTypeEnum = ['filesystem', 'localstorage', 'cloud', 'database'] as const; // 注意与storage_type_check同步修改


// Books 表（Drizzle Schema）
export const books = sqliteTable('books', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    path: text('path').notNull().unique(),
    title: text('title').notNull(),
    author: text('author'),
    format: text('format').notNull(),
    cover: text('cover'),
    storageType: text('storage_type', { enum: storageTypeEnum }).notNull(),
    addedAt: integer('added_at').notNull().default(sql`(strftime('%s', 'now'))`),
    lastReadAt: integer('last_read_at'),
    currentProgress: text('current_progress', { mode: 'json' })
        .$type<ReadingProgress>()
        .notNull()
        .default({}),
    totalCharacters: integer('total_characters').notNull().default(0),
    readCharacters: integer('read_characters').notNull().default(0),
    readingTime: integer('reading_time').notNull().default(0), // 单位：秒
    fileSize: integer('file_size').notNull().default(0),
    status: text('status', { enum: bookStatusEnum }).notNull().default('not_started'),
    tags: text('tags', { mode: 'json' })
        .$type<string[]>()
        .notNull()
        .default([]),
    rating: real('rating'),
    notes: text('notes'),
    createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at').notNull().default(sql`(strftime('%s', 'now'))`),
    deletedAt: integer('deleted_at'),
}, (table) => [
    // CHECK 约束（使用 sql.raw() 直接写入枚举值，避免占位符问题）
    check('status_check', sql.raw(`"books"."status" IN ('not_started', 'reading', 'completed', 'paused')`)),
    check('rating_check', sql`${table.rating} IS NULL OR (${table.rating} >= 0 AND ${table.rating} <= 5)`),
    check('tags_json_check', sql`json_valid(${table.tags})`),
    check('current_progress_json_check', sql`json_valid(${table.currentProgress})`),
    check('books_constraints_check', sql`${table.totalCharacters} >= 0 AND ${table.readCharacters} >= 0 AND ${table.readCharacters} <= ${table.totalCharacters} AND ${table.fileSize} >= 0`),

    // 索引
    index('idx_books_status').on(table.status),
    index('idx_books_added_at').on(table.addedAt),
    index('idx_books_last_read_at').on(table.lastReadAt),
    index('idx_books_title').on(table.title),
    index('idx_books_author').on(table.author),
    index('idx_books_deleted_at').on(table.deletedAt),
    index('idx_books_status_added_at').on(table.status, table.addedAt),
    index('idx_books_status_last_read_at').on(table.status, table.lastReadAt),
]);

// Reading Sessions 表
export const readingSessions = sqliteTable('reading_sessions', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    bookId: integer('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
    startTime: integer('start_time').notNull().default(sql`(strftime('%s', 'now'))`),
    endTime: integer('end_time'),
    duration: integer('duration').default(0), // 单位：秒
    startProgress: text('start_progress', { mode: 'json' })
        .$type<ReadingProgress | null>(),
    endProgress: text('end_progress', { mode: 'json' })
        .$type<ReadingProgress | null>(),
    charactersRead: integer('characters_read').default(0),
    createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
    deletedAt: integer('deleted_at'),
}, (table) => [
    check('reading_sessions_constraints_check', sql`${table.duration} >= 0 AND ${table.charactersRead} >= 0`),
    index('idx_reading_sessions_book_id').on(table.bookId),
    index('idx_reading_sessions_start_time').on(table.startTime),
    index('idx_reading_sessions_deleted_at').on(table.deletedAt),
    index('idx_reading_sessions_book_start_time').on(table.bookId, table.startTime),
    index('idx_reading_sessions_book_end_time').on(table.bookId, table.endTime),
]);

// Comments 表
export const comments = sqliteTable('comments', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    bookId: integer('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    commentType: text('comment_type', { enum: commentTypeEnum }).notNull().default('note'),
    positionInfo: text('position_info', { mode: 'json' })
        .$type<PositionInfo | null>(),
    selectedText: text('selected_text'),
    color: text('color').default('#ffeb3b'),
    tags: text('tags', { mode: 'json' })
        .$type<string[]>()
        .default([]),
    isPrivate: integer('is_private', { mode: 'boolean' }).default(sql`1`),
    createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at').notNull().default(sql`(strftime('%s', 'now'))`),
    deletedAt: integer('deleted_at'),
}, (table) => [
    check('comment_type_check', sql.raw(`"comments"."comment_type" IN ('note', 'highlight', 'underline', 'strike', 'bookmark', 'review')`)),
    check('comments_tags_json_check', sql`json_valid(${table.tags})`),
    check('comments_position_info_json_check', sql`${table.positionInfo} IS NULL OR json_valid(${table.positionInfo})`),
    index('idx_comments_book_id').on(table.bookId),
    index('idx_comments_type').on(table.commentType),
    index('idx_comments_created_at').on(table.createdAt),
    index('idx_comments_deleted_at').on(table.deletedAt),
    index('idx_comments_book_type_created').on(table.bookId, table.commentType, table.createdAt),
]);


/**
 * 阅读进度数据结构
 */
export interface ReadingProgress {
    /** 当前章节 */
    chapter?: number;
    /** 当前页码 */
    page?: number;
    /** 当前位置百分比 */
    percentage?: number;
    /** 当前滚动位置 */
    scroll_position?: number;
    /** 自定义位置标记 */
    custom_marker?: string;
    /** 其他自定义字段 */
    [key: string]: unknown;
}

export type PositionInfo = ReadingProgress;

/**
 * 允许更新的字段列表
 * 这些字段列表用于 SQL 注入防护，确保只有允许的字段可以被更新
 */

/**
 * Books 表允许更新的字段列表
 * 排除字段：id, path, format, storage_type, added_at, created_at, updated_at, deleted_at
 */
export const booksAllowedUpdateFields = generateAllowedUpdateFields(books, [
    'id',
    'path',              // 路径不允许更新
    'format',            // 格式不允许更新
    'storage_type',      // 存储类型不允许更新
    'added_at',          // 添加时间不允许更新
    'created_at',        // 创建时间不允许更新
    'updated_at',        // 更新时间由触发器自动更新
    'deleted_at'         // 软删除字段
]);

/**
 * Comments 表允许更新的字段列表
 * 排除字段：id, book_id, created_at, updated_at, deleted_at
 */
export const commentsAllowedUpdateFields = generateAllowedUpdateFields(comments, [
    'id',
    'book_id',           // 书籍ID不允许更新
    'created_at',        // 创建时间不允许更新
    'updated_at',        // 更新时间由触发器自动更新
    'deleted_at'         // 软删除字段
]);

/**
 * Reading Sessions 表允许更新的字段列表
 * 排除字段：id, book_id, start_time, created_at, deleted_at
 */
export const readingSessionsAllowedUpdateFields = generateAllowedUpdateFields(readingSessions, [
    'id',
    'book_id',           // 书籍ID不允许更新
    'start_time',        // 开始时间不允许更新
    'created_at',        // 创建时间不允许更新
    'deleted_at'         // 软删除字段
]);