import { BookService, initializeBooksDatabase } from '$lib/database/book';
import type { Book } from '$lib/database/book';

export const prerender = false;

export async function load({ params }) {
	try {
		// 初始化数据库
		await initializeBooksDatabase();

		// 加载所有书籍
		const result = await BookService.getAllBooks();
		const books: Book[] = result.success ? result.data || [] : [];

		return {
			...params,
			books,
			bookService: BookService
		};
	} catch (error) {
		console.error('Failed to load books:', error);
		return {
			...params,
			books: [],
			bookService: BookService
		};
	}
}
