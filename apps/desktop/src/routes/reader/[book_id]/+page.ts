import { error } from '@sveltejs/kit';
import { BookService } from '@cozy-reader/database';
import { read_file_to_string, getFileInfo } from '$lib/apis/fs';
import type { FileInfo } from '$lib/backend/types/FileInfo';

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
        // 1. 查询书籍信息
        const bookResult = await BookService.getById(Number(bookId));

        // 如果查询失败，抛出 500 错误
        if (!bookResult.success) {
            throw error(500, {
                message: `查询书籍失败: ${bookResult.error || '未知错误'}`
            });
        }

        // 如果记录不存在，抛出 404 错误
        if (!bookResult.data) {
            throw error(404, {
                message: `未找到指定书籍ID: ${bookId}`
            });
        }

        const book = bookResult.data;

        if (!book.path) {
            throw error(400, {
                message: '书籍文件路径无效'
            });
        }

        // 2. 使用后端 API 获取文件信息（格式、大小、是否文本等）
        let fileInfo: FileInfo;
        try {
            fileInfo = await getFileInfo(book.path);
        } catch (infoErr: any) {
            throw error(500, {
                message: `获取文件信息失败: ${infoErr.message || infoErr}`
            });
        }

        // 3. 如果是文本格式（txt/md/markdown/html），读取文件内容
        // 如果是二进制格式（epub/pdf/mobi等），只返回文件路径，由 FoliateReader 处理
        if (fileInfo.is_text) {
            try {
                const content = await read_file_to_string({ path: book.path });
                return {
                    book_id: bookId,
                    book: book,
                    filePath: book.path,
                    format: fileInfo.format,
                    content: content,
                    isText: true
                };
            } catch (readErr: any) {
                throw error(500, {
                    message: `读取文件失败: ${readErr.message || readErr}`
                });
            }
        } else {
            // EPUB/PDF/MOBI 等格式，直接返回文件路径
            // 前端会使用 convertFileSrc 转换为 URL，然后传给 foliate-view
            return {
                book_id: bookId,
                book: book,
                filePath: book.path,
                format: fileInfo.format,
                isText: false
            };
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
