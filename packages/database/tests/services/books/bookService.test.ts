import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BookService } from '../../../src/services/books/bookService';
import * as executor from '../../../src/core/execution';
import { setDatabaseLogger } from '../../../src/core/logging';

const mocks = vi.hoisted(() => ({
    db: {},
    getDatabase: vi.fn()
}));

const logger = {
    warn: vi.fn(),
    error: vi.fn()
};

vi.mock('../../../src/core/database', () => ({
    DatabaseManager: {
        getInstance: () => ({
            getDatabase: mocks.getDatabase
        })
    }
}));

vi.mock('../../../src/core/execution', () => ({
    executeSelect: vi.fn(),
    executeUpdate: vi.fn()
}));

function createBookRecord(overrides: Record<string, unknown> = {}) {
    return {
        id: 1,
        path: 'D:/books/book.epub',
        title: 'Book',
        author: null,
        format: 'epub',
        cover: null,
        storage_type: 'filesystem',
        added_at: 1,
        last_read_at: null,
        current_progress: '{}',
        reader_settings: '{}',
        total_characters: 0,
        read_characters: 0,
        reading_time: 0,
        file_size: 0,
        status: 'not_started',
        tags: '[]',
        rating: null,
        notes: null,
        created_at: 1,
        updated_at: 1,
        deleted_at: null,
        ...overrides
    };
}

describe('BookService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.getDatabase.mockResolvedValue(mocks.db);
        setDatabaseLogger(logger);
        vi.mocked(executor.executeUpdate).mockResolvedValue({
            rowsAffected: 1,
            lastInsertId: 0
        });
        vi.mocked(executor.executeSelect).mockResolvedValue([
            createBookRecord({ cover: 'data:image/png;base64,Y292ZXI=' })
        ]);
    });

    afterEach(() => {
        setDatabaseLogger(undefined);
    });

    it('应该支持更新 cover 字段', async () => {
        const cover = 'data:image/png;base64,Y292ZXI=';

        const result = await BookService.update(1, { cover });

        expect(result.success).toBe(true);
        expect(executor.executeUpdate).toHaveBeenCalledWith(
            mocks.db,
            'books',
            'UPDATE books SET cover = ? WHERE id = ? AND deleted_at IS NULL',
            [cover, 1],
            expect.objectContaining({ operationName: 'books.update' })
        );
    });

    it('应该支持更新 fileSize 字段', async () => {
        const result = await BookService.update(1, { fileSize: 1234 });

        expect(result.success).toBe(true);
        expect(executor.executeUpdate).toHaveBeenCalledWith(
            mocks.db,
            'books',
            'UPDATE books SET file_size = ? WHERE id = ? AND deleted_at IS NULL',
            [1234, 1],
            expect.objectContaining({ operationName: 'books.update' })
        );
    });

    it('应该在 JSON 字段类型不符合预期时记录警告并保留原始值', async () => {
        vi.mocked(executor.executeSelect).mockResolvedValueOnce([
            createBookRecord({
                current_progress: { chapter: 3 }
            })
        ]);

        const result = await BookService.list();

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(logger.warn).toHaveBeenCalledWith(
            'Unexpected type for JSON field current_progress: expected string, got object. Using original value.'
        );
    });

    it('应该在 getAllTags 遇到异常标签值时跳过并记录警告', async () => {
        const badValue = {
            toString() {
                throw new Error('bad tag');
            }
        };

        vi.mocked(executor.executeSelect).mockResolvedValueOnce([
            { value: 'zeta' },
            { value: badValue },
            { value: 'alpha' }
        ]);

        const result = await BookService.getAllTags();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(['alpha', 'zeta']);
        expect(logger.warn).toHaveBeenCalledWith(
            'Invalid tag value in getAllTags:',
            badValue,
            expect.any(Error)
        );
    });
});
