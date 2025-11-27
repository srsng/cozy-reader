import { invoke } from '@tauri-apps/api/core';
import type {
    CreateBookInput,
    UpdateBookInput,
    BookFilters,
    Pagination,
    BookEntity,
} from '../types';

/**
 * 书籍服务
 * 调用 Tauri Commands 进行数据库操作
 */
export class BookService {
    /**
     * 创建书籍
     */
    static async create(input: CreateBookInput): Promise<BookEntity> {
        return invoke<BookEntity>('create_book', { input });
    }

    /**
     * 根据 ID 获取书籍
     */
    static async getById(id: number): Promise<BookEntity | null> {
        return invoke<BookEntity | null>('get_book', { id });
    }

    /**
     * 列表查询书籍
     */
    static async list(
        filters?: BookFilters,
        pagination?: Pagination
    ): Promise<BookEntity[]> {
        return invoke<BookEntity[]>('list_books', { filters, pagination });
    }

    /**
     * 更新书籍
     */
    static async update(input: UpdateBookInput): Promise<BookEntity> {
        return invoke<BookEntity>('update_book', { input });
    }

    /**
     * 软删除书籍
     */
    static async softDelete(id: number): Promise<void> {
        return invoke<void>('soft_delete_book', { id });
    }

    /**
     * 硬删除书籍（物理删除）
     */
    static async hardDelete(id: number): Promise<void> {
        return invoke<void>('hard_delete_book', { id });
    }

    /**
     * 恢复书籍
     */
    static async restore(id: number): Promise<BookEntity> {
        return invoke<BookEntity>('restore_book', { id });
    }
}

