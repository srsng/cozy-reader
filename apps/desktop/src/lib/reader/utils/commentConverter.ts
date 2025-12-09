/**
 * Comment 和 BookNote 之间的转换工具
 * 处理数据库 Comment 类型和 foliate-js BookNote 类型之间的转换
 */

import type { Comment, NewComment, PositionInfo } from '@cozy-reader/database';
import type { BookNote } from '../types';

/**
 * 将数据库 Comment 转换为 BookNote（foliate-js 格式）
 * @param comment 数据库 Comment 对象
 * @param bookHash 可选的书籍哈希值（运行时字段）
 * @returns BookNote 对象
 */
export function commentToBookNote(comment: Comment, bookHash?: string): BookNote {
    const positionInfo = (comment.positionInfo as PositionInfo | null) || {};
    const cfi = positionInfo.cfi || '';

    return {
        bookHash,
        id: comment.externalId || String(comment.id),
        type: comment.commentType,
        cfi,
        text: comment.selectedText || undefined,
        color: comment.color || undefined,
        note: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        deletedAt: comment.deletedAt || undefined,
    };
}

/**
 * 将 BookNote（foliate-js 格式）转换为数据库 NewComment
 * @param note BookNote 对象
 * @param bookId 书籍 ID
 * @returns NewComment 对象
 */
export function bookNoteToComment(note: BookNote, bookId: number): NewComment {
    const positionInfo: PositionInfo = {
        cfi: note.cfi,
    };

    return {
        bookId,
        content: note.note,
        commentType: note.type,
        positionInfo,
        selectedText: note.text || null,
        color: note.color || null,
        externalId: note.id,
        tags: [],
        isPrivate: true,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        deletedAt: note.deletedAt || null,
    };
}

/**
 * 批量转换 Comment 数组为 BookNote 数组
 */
export function commentsToBookNotes(
    comments: Comment[],
    bookHash?: string
): BookNote[] {
    return comments.map((comment) => commentToBookNote(comment, bookHash));
}

/**
 * 批量转换 BookNote 数组为 NewComment 数组
 */
export function bookNotesToComments(notes: BookNote[], bookId: number): NewComment[] {
    return notes.map((note) => bookNoteToComment(note, bookId));
}
