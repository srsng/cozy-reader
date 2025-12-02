/**
 * Books 数据库 Schema 默认值常量
 * 从 schema.ts 自动提取，确保与 schema 定义同步
 */

import { books, comments, readingSessions } from './schema';
import { getDefaultValue } from '../schema-utils';

/**
 * Books 表默认值（从 schema 自动提取）
 */
export const BOOKS_DEFAULTS = {
    status: getDefaultValue(books.status) ?? 'not_started',
    tags: getDefaultValue(books.tags) ?? [],
    currentProgress: getDefaultValue(books.currentProgress) ?? {},
    totalCharacters: getDefaultValue(books.totalCharacters) ?? 0,
    readCharacters: getDefaultValue(books.readCharacters) ?? 0,
    readingTime: getDefaultValue(books.readingTime) ?? 0,
    fileSize: getDefaultValue(books.fileSize) ?? 0,
} as const;

/**
 * Comments 表默认值（从 schema 自动提取）
 */
export const COMMENTS_DEFAULTS = {
    commentType: getDefaultValue(comments.commentType) ?? 'note',
    color: getDefaultValue(comments.color) ?? '#ffeb3b',
    tags: getDefaultValue(comments.tags) ?? [],
    // isPrivate 使用 SQL 表达式 sql`1`，需要手动处理
    isPrivate: 1, // SQLite boolean: 1 = true
    positionInfo: getDefaultValue(comments.positionInfo) ?? null,
} as const;

/**
 * Reading Sessions 表默认值（从 schema 自动提取）
 */
export const READING_SESSIONS_DEFAULTS = {
    startProgress: getDefaultValue(readingSessions.startProgress) ?? null,
    endProgress: getDefaultValue(readingSessions.endProgress) ?? null,
    duration: getDefaultValue(readingSessions.duration) ?? 0,
    charactersRead: getDefaultValue(readingSessions.charactersRead) ?? 0,
} as const;

