import { books, readingSessions, comments } from '../../../drizzle/books/schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

import type { BookStatus, CommentType, StorageType, ReadingProgress, PositionInfo } from '../../../drizzle/books/schema';

export type { BookStatus, CommentType, StorageType, ReadingProgress, PositionInfo };

// Books 数据库类型
export type Book = InferSelectModel<typeof books>;
export type ReadingSession = InferSelectModel<typeof readingSessions>;
export type Comment = InferSelectModel<typeof comments>;

export type NewBook = InferInsertModel<typeof books>;
export type NewReadingSession = InferInsertModel<typeof readingSessions>;
export type NewComment = InferInsertModel<typeof comments>;

export type BookUpdate = Partial<Omit<NewBook, 'id' | 'createdAt'>>;
export type ReadingSessionUpdate = Partial<Omit<NewReadingSession, 'id' | 'createdAt'>>;
export type CommentUpdate = Partial<Omit<NewComment, 'id' | 'createdAt'>>;

import type { BaseQueryOptions } from './index';

// 查询选项（扩展基础查询选项）
export interface BookQueryOptions extends BaseQueryOptions {
    search?: string;
    status?: BookStatus;
    tags?: string[];
    /** 排序字段 */
    sortBy?: 'title' | 'author' | 'addedAt' | 'lastReadAt' | 'rating';
}

export interface CommentQueryOptions extends BaseQueryOptions {
    bookId?: number;
    commentType?: CommentType;
    search?: string;
    tags?: string[];
    isPrivate?: boolean;
    externalId?: string;
    /** 排序字段 */
    sortBy?: 'createdAt' | 'updatedAt' | 'commentType';
}

export interface ReadingSessionQueryOptions extends BaseQueryOptions {
    bookId?: number;
    /** 排序字段 */
    sortBy?: 'startTime' | 'endTime' | 'durationMinutes';
}

// 统计类型
export interface BookStatistics {
    totalReadingTime: number;
    averageReadingSpeed: number;
    progressPercentage: number;
    estimatedRemainingTime: number;
}

export interface CommentStatistics {
    totalComments: number;
    byType: Record<CommentType, number>;
    byBook: Array<{ bookId: number; count: number }>;
}

export interface BookCommentSummary {
    bookId: number;
    totalComments: number;
    byType: Record<CommentType, number>;
}

export interface ReadingSessionStats {
    totalSessions: number;
    totalReadingTime: number;
    averageSessionDuration: number;
    totalCharactersRead: number;
    averageReadingSpeed: number;
}

// 输入类型

export interface CreateReadingSessionInput {
    bookId: number;
    startProgress?: ReadingProgress;
}

export interface EndReadingSessionInput {
    endProgress?: ReadingProgress;
    charactersRead?: number;
}
