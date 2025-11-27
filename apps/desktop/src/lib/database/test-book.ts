import type { Model as TestBook } from './types/generated/books/Model';
import { invoke } from '@tauri-apps/api/core';

/**
 * 获取测试书籍
 * 使用生成的 TypeScript 类型
 */
export async function getTestBook(id: number): Promise<TestBook | null> {
    const result = await invoke<TestBook | null>('get_test_book', { id });
    return result;
}

