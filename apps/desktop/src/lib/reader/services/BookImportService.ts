import { BookService, type Book, type BookUpdate, type DatabaseResult } from '@cozy-reader/database';
import { getFileInfo as getFileInfoApi } from '$lib/apis/fs';
import type { FileInfo } from '$lib/backend/types/FileInfo';
import type { BookMetadata } from '../types';
import { extractCoverDataUrl } from '../utils/cover';
import { DocumentService } from './DocumentService';

type ImportedBookUpdate = Pick<BookUpdate, 'title' | 'author' | 'cover' | 'fileSize'>;

type BookImportDependencies = {
    addBookByFsPath?: (path: string) => Promise<DatabaseResult<Book>>;
    updateBook?: (id: number, input: ImportedBookUpdate) => Promise<DatabaseResult<Book>>;
    documentService?: Pick<DocumentService, 'importBook'>;
    getFileInfo?: (path: string) => Promise<FileInfo | undefined>;
    warn?: (message: string, error: unknown) => void;
};

function normalizeLocalizedText(value: unknown): string | undefined {
    if (typeof value === 'string') {
        const normalized = value.trim();
        return normalized || undefined;
    }

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return undefined;
    }

    for (const entry of Object.values(value)) {
        const normalized = normalizeLocalizedText(entry);
        if (normalized) {
            return normalized;
        }
    }

    return undefined;
}

function normalizeAuthor(author: BookMetadata['author'] | undefined): string | undefined {
    if (Array.isArray(author)) {
        const authors = author
            .map((item) => normalizeLocalizedText(item.name))
            .filter((item): item is string => Boolean(item));
        return authors.length > 0 ? authors.join(', ') : undefined;
    }

    return normalizeLocalizedText(author);
}

function normalizeFileSize(size: FileInfo['size'] | number | undefined): number | undefined {
    if (typeof size === 'bigint') {
        if (size > BigInt(Number.MAX_SAFE_INTEGER)) {
            return undefined;
        }
        return Number(size);
    }

    if (typeof size === 'number' && Number.isSafeInteger(size) && size >= 0) {
        return size;
    }

    return undefined;
}

export class BookImportService {
    private readonly addBookByFsPathFn: (path: string) => Promise<DatabaseResult<Book>>;
    private readonly updateBook: (id: number, input: ImportedBookUpdate) => Promise<DatabaseResult<Book>>;
    private readonly documentService: Pick<DocumentService, 'importBook'>;
    private readonly getFileInfo: (path: string) => Promise<FileInfo | undefined>;
    private readonly warn: (message: string, error: unknown) => void;

    constructor(dependencies: BookImportDependencies = {}) {
        this.addBookByFsPathFn = dependencies.addBookByFsPath ?? BookService.addBookByFsPath;
        this.updateBook = dependencies.updateBook ?? BookService.update;
        this.documentService = dependencies.documentService ?? new DocumentService();
        this.getFileInfo = dependencies.getFileInfo ?? getFileInfoApi;
        this.warn = dependencies.warn ?? ((message, error) => console.warn(message, error));
    }

    async addBookByFsPath(path: string): Promise<DatabaseResult<Book>> {
        const addResult = await this.addBookByFsPathFn(path);
        if (!addResult.success || !addResult.data) {
            return addResult;
        }

        try {
            const bookDoc = await this.documentService.importBook(path);
            const updateInput: ImportedBookUpdate = {};
            const title = normalizeLocalizedText(bookDoc.metadata?.title);
            const author = normalizeAuthor(bookDoc.metadata?.author);
            const cover = addResult.data.cover ? undefined : await extractCoverDataUrl(bookDoc);
            const fileInfo = await this.getFileInfo(path);
            const fileSize = normalizeFileSize(fileInfo?.size);

            if (title) {
                updateInput.title = title;
            }
            if (author) {
                updateInput.author = author;
            }
            if (cover) {
                updateInput.cover = cover;
            }
            if (fileSize !== undefined) {
                updateInput.fileSize = fileSize;
            }

            if (Object.keys(updateInput).length === 0) {
                return addResult;
            }

            const updateResult = await this.updateBook(addResult.data.id, updateInput);
            if (updateResult.success && updateResult.data) {
                return updateResult;
            }

            this.warn('Failed to save imported book metadata', updateResult);
            return addResult;
        } catch (error) {
            this.warn('Failed to extract imported book metadata', error);
            return addResult;
        }
    }
}

export const bookImportService = new BookImportService();
