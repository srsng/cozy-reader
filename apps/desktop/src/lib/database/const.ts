import { DB_BOOKS_CONFIG } from './book/config';
import type { DatabaseConfig } from './types';

/**
 * 数据库名称枚举
 * 用于标识不同的数据库实例
 * 必须与后端 DATABASES 数组中的名称保持一致
 */
export enum DB_ENUM {
    books = 'books'
}

export type DB_NAME = `${DB_ENUM}`;

/**
 * 数据库配置映射
 * 必须与后端 DATABASES 数组中的配置保持一致
 */
export const DB_CONFIG_MAP: Record<DB_ENUM, DatabaseConfig> = {
    [DB_ENUM.books]: DB_BOOKS_CONFIG
};
