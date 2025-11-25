import type { DatabaseConfig } from '../types';
import { DB_ENUM } from '../const';
import { DatabaseManager } from '../manager';
import type Database from '@tauri-apps/plugin-sql';

/**
 * 数据库配置
 * 必须与后端 DATABASES 数组中的配置保持一致
 */
export const DB_BOOKS_CONFIG: DatabaseConfig = {
    name: 'books',
    filename: 'books.db',
    wal: true
};

/**
 * 获取数据库实例
 * 使用新的多数据库管理器
 */
export async function getDatabase(): Promise<Database> {
    const manager = DatabaseManager.getInstance();
    return await manager.getDatabase(DB_ENUM.books);
}

/**
 * 关闭数据库连接
 */
export async function closeDatabase(): Promise<void> {
    const manager = DatabaseManager.getInstance();
    await manager.closeDatabase(DB_ENUM.books);
}

/**
 * 检查数据库连接状态
 */
export function isDatabaseConnected(): boolean {
    const manager = DatabaseManager.getInstance();
    return manager.isConnected(DB_ENUM.books);
}
