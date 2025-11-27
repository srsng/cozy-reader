import { invoke } from '@tauri-apps/api/core';
import type {
    CreateReadingSessionInput,
    UpdateReadingSessionInput,
    ReadingSessionEntity,
} from '../types';

/**
 * 阅读会话服务
 * 调用 Tauri Commands 进行数据库操作
 */
export class ReadingSessionService {
    /**
     * 创建阅读会话
     */
    static async create(
        input: CreateReadingSessionInput
    ): Promise<ReadingSessionEntity> {
        return invoke<ReadingSessionEntity>('create_reading_session', { input });
    }

    /**
     * 根据 ID 获取阅读会话
     */
    static async getById(
        id: number
    ): Promise<ReadingSessionEntity | null> {
        return invoke<ReadingSessionEntity | null>('get_reading_session', { id });
    }

    /**
     * 根据书籍 ID 列表查询阅读会话
     */
    static async listByBookId(
        bookId: number
    ): Promise<ReadingSessionEntity[]> {
        return invoke<ReadingSessionEntity[]>('list_reading_sessions', {
            bookId,
        });
    }

    /**
     * 更新阅读会话
     */
    static async update(
        input: UpdateReadingSessionInput
    ): Promise<ReadingSessionEntity> {
        return invoke<ReadingSessionEntity>('update_reading_session', { input });
    }

    /**
     * 软删除阅读会话
     */
    static async softDelete(id: number): Promise<void> {
        return invoke<void>('soft_delete_reading_session', { id });
    }

    /**
     * 硬删除阅读会话（物理删除）
     */
    static async hardDelete(id: number): Promise<void> {
        return invoke<void>('hard_delete_reading_session', { id });
    }

    /**
     * 恢复阅读会话
     */
    static async restore(id: number): Promise<ReadingSessionEntity> {
        return invoke<ReadingSessionEntity>('restore_reading_session', { id });
    }
}

