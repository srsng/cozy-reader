import { error } from '@sveltejs/kit';
import { BookService } from '$lib/database/book';
import { invoke } from '$lib/backend/ipc.js';

export const prerender = false;

export async function load({ params }) {
	const bookId = params.book_id;

	// 检查book_id是否为数字
	if (!/^\d+$/.test(bookId)) {
		throw error(400, {
			message: `无效的书籍ID: ${bookId}`
		});
	}

	try {
		const book = await BookService.getBookById(Number(bookId));

		if (!book) {
			throw error(404, {
				message: `未找到指定书籍ID: ${bookId}`
			});
		}

		if (!book.path) {
			throw error(400, {
				message: '书籍文件路径无效'
			});
		}

		// 读取markdown文件内容
		try {
			const markdownContent = await invoke('read_markdown_file', { path: book.path });

			return {
				book_id: bookId,
				book: book,
				markdownContent: markdownContent
			};
		} catch (fileError) {
			throw error(500, {
				message: `无法读取文件: ${book.path}\n\n错误信息: ${fileError}`
			});
		}
	} catch (err: any) {
		// 如果是已经抛出的error，直接重新抛出
		if (err.status) {
			throw err;
		}

		// 其他未知错误
		throw error(500, {
			message: `加载书籍时出错: ${err.message || err}`
		});
	}
}
