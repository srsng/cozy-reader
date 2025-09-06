import { redirect } from '@sveltejs/kit';
import {
	BookService,
	BookFormat,
	StorageType,
	isSupportFormat,
	getFileFormat
} from '$lib/database/book';
import { getReadBookUrl, redirectBack } from '$lib/utils/route.svelte.js';
import { page } from '$app/state';
import { toast } from 'svelte-sonner';

export const prerender = false;

export async function load({ params }) {
	// 重构路径参数
	const pathSegments = params.path || [];
	const filePath = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;
	console.log(filePath);

	if (!isSupportFormat(filePath)) {
		return {
			error: {
				type: 'unsupported_file',
				message: `不支持的文件类型`,
				filePath: filePath
			}
		};
	}

	try {
		// 检查书籍是否已存在
		const existingBook = await BookService.getBookByPath(filePath);

		if (existingBook) {
			// 如果书籍已存在，直接重定向到该书籍页面
			if (page.url.searchParams.get('goRead')) {
				// 重定向到新创建的书籍页面
				throw redirect(302, getReadBookUrl(existingBook.id));
			} else {
				toast.info('书籍已存在', {
					description: `书籍标题: ${existingBook.title}`
				});
				redirectBack();
			}
			return {
				existingBook
			};
		}

		// 自动添加新书籍
		const fileName = filePath.split(/[\/]/).pop() || 'Unknown';
		const title = fileName.replace(/\.md$/i, '');

		const createResult = await BookService.createBook({
			path: filePath,
			title: title,
			author: '',
			format: getFileFormat(filePath) as BookFormat,
			storage_type: StorageType.FILESYSTEM,
			notes: `通过链接打开的书籍: ${title}`
		});

		if (!createResult.success) {
			return {
				error: {
					type: 'create_failed',
					message: `创建书籍失败: ${createResult.error}`,
					filePath: filePath
				}
			};
		}

		if (page.url.searchParams.get('goRead')) {
			// 重定向到新创建的书籍页面
			throw redirect(302, getReadBookUrl(createResult.data!.id));
		} else {
			toast.info('书籍添加成功', {
				description: `书籍标题: ${title}`
			});
			redirectBack();
		}
	} catch (error: any) {
		// 如果是重定向错误，直接抛出
		if (error.status === 302) {
			throw error;
		}

		// 其他错误，返回错误信息
		console.error('添加书籍时出错:', error);
		return {
			error: {
				type: 'unknown_error',
				message: `添加书籍失败: ${error.message || error}`,
				filePath: filePath
			}
		};
	}
}
