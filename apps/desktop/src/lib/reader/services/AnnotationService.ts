/**
 * AnnotationService - 注释服务
 * 提供高亮、书签、笔记的 CRUD 操作
 */

import type { FoliateViewElement, BookNote } from '../types';
import { bookDataStore } from '../stores/bookDataStore';
import { CommentService } from '@cozy-reader/database';
import { commentToBookNote, bookNoteToComment } from '../utils/commentConverter';

/**
 * 注释服务类
 */
export class AnnotationService {
    /**
     * 添加注释（高亮/书签/笔记）
     * @param view foliate-view 实例
     * @param note 笔记对象
     * @returns 添加结果，包含索引和标签
     */
    async addAnnotation(
        view: FoliateViewElement,
        note: BookNote
    ): Promise<{ index: number; label: string }> {
        try {
            // 使用 foliate-view 的 addAnnotation API
            const result = await view.addAnnotation(note);
            return result;
        } catch (error) {
            console.error('Failed to add annotation:', error);
            throw error;
        }
    }

    /**
     * 删除注释
     * @param view foliate-view 实例
     * @param note 笔记对象
     */
    async removeAnnotation(view: FoliateViewElement, note: BookNote): Promise<void> {
        try {
            await view.deleteAnnotation(note);
        } catch (error) {
            console.error('Failed to remove annotation:', error);
            throw error;
        }
    }

    /**
     * 从数据库加载注释
     * @param bookKey 书籍键
     */
    async loadAnnotationsFromDatabase(bookKey: string): Promise<void> {
        const bookData = bookDataStore.getBookData(bookKey);
        if (!bookData?.book?.id) {
            console.warn('No book data found for loading annotations:', bookKey);
            return;
        }

        try {
            const bookId = bookData.book.id;
            const result = await CommentService.listByBookId(bookId);

            if (!result.success || !result.data) {
                console.warn('Failed to load annotations from database:', result.error);
                return;
            }

            const comments = result.data;
            const booknotes = comments
                .filter((comment) => !comment.deletedAt)
                .map((comment) => commentToBookNote(comment, bookData.config?.bookHash));

            // 更新 BookDataStore 作为运行时缓存
            bookDataStore.updateBooknotes(bookKey, booknotes);
        } catch (error) {
            console.error('Failed to load annotations from database:', error);
        }
    }

    /**
     * 获取所有注释（从运行时缓存）
     * @param bookKey 书籍键
     * @returns 笔记列表
     */
    getAnnotations(bookKey: string): BookNote[] {
        const config = bookDataStore.getConfig(bookKey);
        return config?.booknotes || [];
    }

    /**
     * 保存注释到数据库
     * @param bookKey 书籍键
     * @param note 笔记对象
     */
    async saveAnnotation(bookKey: string, note: BookNote): Promise<void> {
        try {
            const bookData = bookDataStore.getBookData(bookKey);
            if (!bookData?.book?.id) {
                console.warn('No book data found for saving annotation:', bookKey);
                return;
            }

            const bookId = bookData.book.id;
            const newComment = bookNoteToComment(note, bookId);

            // 检查是否已存在（通过 externalId）
            if (note.id) {
                const existingResult = await CommentService.list({
                    bookId,
                    externalId: note.id
                });

                if (
                    existingResult.success &&
                    existingResult.data &&
                    existingResult.data.length > 0
                ) {
                    // 更新现有注释
                    const existingComment = existingResult.data[0];
                    if (existingComment) {
                        const updateResult = await CommentService.update(existingComment.id, {
                            content: newComment.content,
                            commentType: newComment.commentType,
                            positionInfo: newComment.positionInfo,
                            selectedText: newComment.selectedText,
                            color: newComment.color,
                            externalId: newComment.externalId,
                            updatedAt: Date.now()
                        });

                        if (updateResult.success && updateResult.data) {
                            // 更新运行时缓存
                            const updatedNote = commentToBookNote(
                                updateResult.data,
                                bookData.config?.bookHash
                            );
                            const booknotes = bookData.config?.booknotes || [];
                            const existingIndex = booknotes.findIndex(
                                (item) => item.id === note.id
                            );
                            if (existingIndex !== -1) {
                                booknotes[existingIndex] = updatedNote;
                            } else {
                                booknotes.push(updatedNote);
                            }
                            bookDataStore.updateBooknotes(bookKey, booknotes);
                        }
                    }
                } else {
                    // 创建新注释
                    const createResult = await CommentService.create(newComment);
                    if (createResult.success && createResult.data) {
                        // 更新运行时缓存
                        const createdNote = commentToBookNote(
                            createResult.data,
                            bookData.config?.bookHash
                        );
                        const booknotes = bookData.config?.booknotes || [];
                        booknotes.push(createdNote);
                        bookDataStore.updateBooknotes(bookKey, booknotes);
                    }
                }
            } else {
                // 没有 externalId，直接创建
                const createResult = await CommentService.create(newComment);
                if (createResult.success && createResult.data) {
                    // 更新运行时缓存
                    const createdNote = commentToBookNote(
                        createResult.data,
                        bookData.config?.bookHash
                    );
                    const booknotes = bookData.config?.booknotes || [];
                    booknotes.push(createdNote);
                    bookDataStore.updateBooknotes(bookKey, booknotes);
                }
            }
        } catch (error) {
            console.error('Failed to save annotation:', error);
            throw error;
        }
    }

    /**
     * 更新注释
     * @param bookKey 书籍键
     * @param noteId 笔记 ID（externalId 或 id）
     * @param updates 更新内容
     */
    async updateAnnotation(
        bookKey: string,
        noteId: string,
        updates: Partial<BookNote>
    ): Promise<void> {
        try {
            const bookData = bookDataStore.getBookData(bookKey);
            if (!bookData?.book?.id) {
                console.warn('No book data found for updating annotation:', bookKey);
                return;
            }

            const bookId = bookData.book.id;
            const booknotes = bookData.config?.booknotes || [];
            const existingNote = booknotes.find((item) => item.id === noteId && !item.deletedAt);

            if (!existingNote) {
                console.warn('Annotation not found:', noteId);
                return;
            }

            const updatedNote: BookNote = {
                ...existingNote,
                ...updates,
                updatedAt: Date.now()
            };

            // 查找数据库中的注释（通过 externalId）
            const existingResult = await CommentService.list({
                bookId,
                externalId: noteId
            });

            if (existingResult.success && existingResult.data && existingResult.data.length > 0) {
                const existingComment = existingResult.data[0];
                if (existingComment) {
                    const newComment = bookNoteToComment(updatedNote, bookId);
                    const updateResult = await CommentService.update(existingComment.id, {
                        content: newComment.content,
                        commentType: newComment.commentType,
                        positionInfo: newComment.positionInfo,
                        selectedText: newComment.selectedText,
                        color: newComment.color,
                        externalId: newComment.externalId,
                        updatedAt: Date.now()
                    });

                    if (updateResult.success && updateResult.data) {
                        // 更新运行时缓存
                        const dbNote = commentToBookNote(
                            updateResult.data,
                            bookData.config?.bookHash
                        );
                        const index = booknotes.findIndex((item) => item.id === noteId);
                        if (index !== -1) {
                            booknotes[index] = dbNote;
                            bookDataStore.updateBooknotes(bookKey, booknotes);
                        }
                    }
                }
            } else {
                // 如果数据库中没有，尝试创建
                await this.saveAnnotation(bookKey, updatedNote);
            }
        } catch (error) {
            console.error('Failed to update annotation:', error);
            throw error;
        }
    }

    /**
     * 删除注释（软删除）
     * @param bookKey 书籍键
     * @param noteId 笔记 ID（externalId 或 id）
     */
    async deleteAnnotation(bookKey: string, noteId: string): Promise<void> {
        try {
            const bookData = bookDataStore.getBookData(bookKey);
            if (!bookData?.book?.id) {
                console.warn('No book data found for deleting annotation:', bookKey);
                return;
            }

            const bookId = bookData.book.id;

            // 查找数据库中的注释（通过 externalId）
            const existingResult = await CommentService.list({
                bookId,
                externalId: noteId
            });

            if (existingResult.success && existingResult.data && existingResult.data.length > 0) {
                const existingComment = existingResult.data[0];
                if (existingComment) {
                    // 软删除数据库中的注释
                    await CommentService.softDelete(existingComment.id);
                }
            }

            // 更新运行时缓存
            const booknotes = bookData.config?.booknotes || [];
            const index = booknotes.findIndex((item) => item.id === noteId);
            if (index !== -1) {
                booknotes[index] = {
                    ...booknotes[index]!,
                    deletedAt: Date.now()
                };
                bookDataStore.updateBooknotes(bookKey, booknotes);
            }
        } catch (error) {
            console.error('Failed to delete annotation:', error);
            throw error;
        }
    }

    /**
     * 根据 CFI 获取注释
     * @param bookKey 书籍键
     * @param cfi CFI 位置
     * @returns 匹配的笔记列表
     */
    getAnnotationsByCFI(bookKey: string, cfi: string): BookNote[] {
        const annotations = this.getAnnotations(bookKey);
        return annotations.filter((item) => item.cfi === cfi && !item.deletedAt);
    }

    /**
     * 根据类型获取注释
     * @param bookKey 书籍键
     * @param type 笔记类型
     * @returns 匹配的笔记列表
     */
    getAnnotationsByType(bookKey: string, type: BookNote['type']): BookNote[] {
        const annotations = this.getAnnotations(bookKey);
        return annotations.filter((item) => item.type === type && !item.deletedAt);
    }
}

// 导出单例实例
export const annotationService = new AnnotationService();
