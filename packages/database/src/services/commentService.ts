import { invoke } from '@tauri-apps/api/core';
import type {
    CreateCommentInput,
    UpdateCommentInput,
    CommentEntity,
} from '../types';

/**
 * 评论服务
 * 调用 Tauri Commands 进行数据库操作
 */
export class CommentService {
    /**
     * 创建评论
     */
    static async create(input: CreateCommentInput): Promise<CommentEntity> {
        return invoke<CommentEntity>('create_comment', { input });
    }

    /**
     * 根据 ID 获取评论
     */
    static async getById(id: number): Promise<CommentEntity | null> {
        return invoke<CommentEntity | null>('get_comment', { id });
    }

    /**
     * 根据书籍 ID 列表查询评论
     */
    static async listByBookId(bookId: number): Promise<CommentEntity[]> {
        return invoke<CommentEntity[]>('list_comments', { bookId });
    }

    /**
     * 更新评论
     */
    static async update(input: UpdateCommentInput): Promise<CommentEntity> {
        return invoke<CommentEntity>('update_comment', { input });
    }

    /**
     * 软删除评论
     */
    static async softDelete(id: number): Promise<void> {
        return invoke<void>('soft_delete_comment', { id });
    }

    /**
     * 硬删除评论（物理删除）
     */
    static async hardDelete(id: number): Promise<void> {
        return invoke<void>('hard_delete_comment', { id });
    }

    /**
     * 恢复评论
     */
    static async restore(id: number): Promise<CommentEntity> {
        return invoke<CommentEntity>('restore_comment', { id });
    }
}

