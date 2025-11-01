import { BookService, initializeBooksDatabase } from '$lib/database/book';

export const prerender = false;

export async function load({ params }) {
    try {
        // 初始化数据库
        await initializeBooksDatabase();
        return {
            ...params,
            bookService: BookService
        };
    } catch (error) {
        console.error('Failed to load books:', error);
        return {
            ...params,
            bookService: BookService
        };
    }
}
