import { DB_BOOKS_CONFIG } from './book/config';
import type { DatabaseConfig } from './types';

export enum DB_ENUM {
    books = 'books'
}

export type DB_NAME = `${DB_ENUM}`;

export const DB_CONFIG_MAP: Record<DB_NAME, DatabaseConfig> = {
    books: DB_BOOKS_CONFIG
};
