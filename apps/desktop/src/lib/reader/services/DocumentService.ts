import { convertFileSrc } from '@tauri-apps/api/core';
import type { Book } from '@cozy-reader/database';
import type { BookDoc } from '../types';
import { DocumentLoader } from '../document';
import { exists, getFileInfo } from '../../apis/fs';

/**
 * DocumentService - 文档加载服务
 * 封装文件加载逻辑，处理 Tauri 文件系统访问
 */
export class DocumentService {
    /**
     * 从文件路径加载书籍内容
     * 文件解析策略（按优先级）：
     * 1. 本地文件系统路径
     * 2. 临时文件路径（未保存到库）
     * 3. 远程 URL（HTTP/HTTPS）
     */
    async loadBookContent(book: Book): Promise<BookDoc> {
        if (!book.path) {
            throw new Error('Book path is required');
        }

        // 检查文件是否存在
        const fileExists = await exists({ path: book.path });
        if (!fileExists) {
            throw new Error(`Book file not found: ${book.path}`);
        }

        // 获取文件信息
        const fileInfo = await getFileInfo(book.path);

        // 转换文件路径为可访问的 URL
        const fileUrl = convertFileSrc(book.path);

        // 获取文件内容
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to load book file: ${response.statusText}`);
        }

        const blob = await response.blob();
        const file = new File([blob], book.path.split(/[\\/]/).pop() || 'book', {
            type: fileInfo.mime_type || 'application/octet-stream'
        });

        // 使用 DocumentLoader 解析
        const loader = new DocumentLoader(file);
        const { book: bookDoc } = await loader.open();

        return bookDoc;
    }

    /**
     * 从文件路径或 File 对象导入书籍
     */
    async importBook(file: File | string): Promise<BookDoc> {
        let fileObj: File;

        if (typeof file === 'string') {
            // 从路径加载
            const fileUrl = convertFileSrc(file);
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error(`Failed to load file: ${response.statusText}`);
            }
            const blob = await response.blob();
            fileObj = new File([blob], file.split(/[\\/]/).pop() || 'book', {
                type: blob.type || 'application/octet-stream'
            });
        } else {
            fileObj = file;
        }

        // TXT 文件需要先转换为 EPUB（TODO: 后续实现转换逻辑）
        if (fileObj.name.endsWith('.txt')) {
            // 暂时直接使用 DocumentLoader，后续可以实现转换
            // const txt2epub = new TxtToEpubConverter();
            // ({ file: fileObj } = await txt2epub.convert({ file: fileObj }));
        }

        const loader = new DocumentLoader(fileObj);
        const { book: bookDoc } = await loader.open();

        return bookDoc;
    }
}
