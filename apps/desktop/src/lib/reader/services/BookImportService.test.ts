import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Book, DatabaseResult } from '@cozy-reader/database';
import type { FileInfo } from '$lib/backend/types/FileInfo';
import type { BookDoc } from '../types';
import { BookImportService } from './BookImportService';

vi.mock('@cozy-reader/database', () => ({
    BookService: {
        addBookByFsPath: vi.fn(),
        update: vi.fn()
    }
}));

vi.mock('./DocumentService', () => ({
    DocumentService: vi.fn()
}));

function createBook(overrides: Partial<Book> = {}): Book {
    return {
        id: 1,
        path: 'D:/books/book.epub',
        title: 'Book',
        author: null,
        format: 'epub',
        cover: null,
        storageType: 'filesystem',
        addedAt: 1,
        lastReadAt: null,
        currentProgress: {},
        readerSettings: {},
        totalCharacters: 0,
        readCharacters: 0,
        readingTime: 0,
        fileSize: 0,
        status: 'not_started',
        tags: [],
        rating: null,
        notes: null,
        createdAt: 1,
        updatedAt: 1,
        deletedAt: null,
        ...overrides
    } as Book;
}

function success<T>(data: T): DatabaseResult<T> {
    return { success: true, data };
}

function failure<T>(error: string): DatabaseResult<T> {
    return { success: false, error };
}

describe('BookImportService', () => {
    const addBookByFsPath = vi.fn();
    const updateBook = vi.fn();
    const importBook = vi.fn();
    const getFileInfo = vi.fn();
    const warn = vi.fn();

    beforeEach(() => {
        addBookByFsPath.mockReset();
        updateBook.mockReset();
        importBook.mockReset();
        getFileInfo.mockReset();
        warn.mockReset();
    });

    function createService() {
        return new BookImportService({
            addBookByFsPath,
            updateBook,
            documentService: { importBook },
            getFileInfo,
            warn
        });
    }

    function createFileInfo(size: bigint): FileInfo {
        return {
            path: 'D:/books/book.epub',
            size,
            format: 'epub',
            mime_type: 'application/epub+zip',
            is_text: false
        };
    }

    it('应该在添加书籍失败时直接返回失败且不解析封面', async () => {
        const result = failure<Book>('添加失败');
        addBookByFsPath.mockResolvedValue(result);

        await expect(createService().addBookByFsPath('D:/books/book.epub')).resolves.toBe(result);
        expect(importBook).not.toHaveBeenCalled();
        expect(updateBook).not.toHaveBeenCalled();
    });

    it('应该在添加成功后提取基础元数据并返回更新后的书籍', async () => {
        const createdBook = createBook();
        const updatedBook = createBook({
            title: '元数据书名',
            author: '作者A',
            cover: 'data:image/jpeg;base64,Y292ZXI=',
            fileSize: 1234
        });
        const bookDoc = {
            metadata: {
                title: '元数据书名',
                author: '作者A'
            },
            getCover: vi.fn().mockResolvedValue(new Blob(['cover'], { type: 'image/jpeg' }))
        } as unknown as BookDoc;

        addBookByFsPath.mockResolvedValue(success(createdBook));
        importBook.mockResolvedValue(bookDoc);
        getFileInfo.mockResolvedValue(createFileInfo(1234n));
        updateBook.mockResolvedValue(success(updatedBook));

        const result = await createService().addBookByFsPath('D:/books/book.epub');

        expect(result).toEqual(success(updatedBook));
        expect(importBook).toHaveBeenCalledWith('D:/books/book.epub');
        expect(updateBook).toHaveBeenCalledWith(1, {
            title: '元数据书名',
            author: '作者A',
            cover: 'data:image/jpeg;base64,Y292ZXI=',
            fileSize: 1234
        });
    });

    it('应该规范化本地化标题和多作者元数据', async () => {
        const createdBook = createBook();
        const updatedBook = createBook({
            title: '中文书名',
            author: '作者甲, Author B',
            fileSize: 5678
        });
        const bookDoc = {
            metadata: {
                title: { 'zh-CN': '中文书名', en: 'English Title' },
                author: [{ name: { 'zh-CN': '作者甲' } }, { name: 'Author B' }]
            },
            getCover: vi.fn().mockResolvedValue(null)
        } as unknown as BookDoc;

        addBookByFsPath.mockResolvedValue(success(createdBook));
        importBook.mockResolvedValue(bookDoc);
        getFileInfo.mockResolvedValue(createFileInfo(5678n));
        updateBook.mockResolvedValue(success(updatedBook));

        const result = await createService().addBookByFsPath('D:/books/book.epub');

        expect(result).toEqual(success(updatedBook));
        expect(updateBook).toHaveBeenCalledWith(1, {
            title: '中文书名',
            author: '作者甲, Author B',
            fileSize: 5678
        });
    });

    it('应该在文档没有封面时返回原添加结果', async () => {
        const createdBook = createBook();
        const bookDoc = {
            getCover: vi.fn().mockResolvedValue(null)
        } as unknown as BookDoc;

        addBookByFsPath.mockResolvedValue(success(createdBook));
        importBook.mockResolvedValue(bookDoc);

        const result = await createService().addBookByFsPath('D:/books/book.epub');

        expect(result).toEqual(success(createdBook));
        expect(updateBook).not.toHaveBeenCalled();
    });

    it('应该在封面提取异常时保留导入成功结果', async () => {
        const createdBook = createBook();
        addBookByFsPath.mockResolvedValue(success(createdBook));
        importBook.mockRejectedValue(new Error('broken epub'));

        const result = await createService().addBookByFsPath('D:/books/book.epub');

        expect(result).toEqual(success(createdBook));
        expect(updateBook).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalledOnce();
    });

    it('应该在封面更新失败时保留导入成功结果', async () => {
        const createdBook = createBook();
        const bookDoc = {
            getCover: vi.fn().mockResolvedValue(new Blob(['cover'], { type: 'image/jpeg' }))
        } as unknown as BookDoc;

        addBookByFsPath.mockResolvedValue(success(createdBook));
        importBook.mockResolvedValue(bookDoc);
        updateBook.mockResolvedValue(failure<Book>('更新失败'));

        const result = await createService().addBookByFsPath('D:/books/book.epub');

        expect(result).toEqual(success(createdBook));
        expect(warn).toHaveBeenCalledOnce();
    });
});
