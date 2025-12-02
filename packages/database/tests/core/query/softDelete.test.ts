import { describe, it, expect, vi, beforeEach } from 'vitest';
import Database from '@tauri-apps/plugin-sql';
import { softDelete, hardDelete, restoreDeleted, isDeleted } from '../../../src/core/query/softDelete';
import { DatabaseError } from '../../../src/core/errors';
import * as executor from '../../../src/core/execution/executor';

// Mock executeUpdate 和 executeSelect
vi.mock('../../../src/core/execution/executor', () => ({
    executeUpdate: vi.fn(),
    executeSelect: vi.fn()
}));

describe('softDelete', () => {
    let mockDb: Database;
    const dbName = 'books' as const;

    beforeEach(() => {
        vi.clearAllMocks();
        mockDb = {} as Database;
    });

    describe('softDelete', () => {
        it('应该成功软删除记录', async () => {
            vi.mocked(executor.executeUpdate).mockResolvedValue({
                rowsAffected: 1,
                lastInsertId: 0
            });

            await expect(softDelete(mockDb, dbName, 'books', 1)).resolves.not.toThrow();
            expect(executor.executeUpdate).toHaveBeenCalledWith(
                mockDb,
                dbName,
                'UPDATE books SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL',
                expect.arrayContaining([expect.any(Number), 1]),
                expect.objectContaining({ operationName: 'softDelete:books' })
            );
        });

        it('应该使用自定义 deletedAtColumn', async () => {
            vi.mocked(executor.executeUpdate).mockResolvedValue({
                rowsAffected: 1,
                lastInsertId: 0
            });

            await softDelete(mockDb, dbName, 'books', 1, 'removed_at');
            expect(executor.executeUpdate).toHaveBeenCalledWith(
                mockDb,
                dbName,
                'UPDATE books SET removed_at = ? WHERE id = ? AND removed_at IS NULL',
                expect.any(Array),
                expect.any(Object)
            );
        });

        it('应该抛出错误当记录不存在或已删除', async () => {
            vi.mocked(executor.executeUpdate).mockResolvedValue({
                rowsAffected: 0,
                lastInsertId: 0
            });

            await expect(softDelete(mockDb, dbName, 'books', 999)).rejects.toThrow(DatabaseError);
            try {
                await softDelete(mockDb, dbName, 'books', 999);
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseError);
                expect((error as DatabaseError).code).toBe('RECORD_NOT_FOUND');
            }
        });

        it('应该抛出错误当表名无效', async () => {
            await expect(softDelete(mockDb, dbName, 'books; DROP TABLE', 1)).rejects.toThrow(DatabaseError);
            try {
                await softDelete(mockDb, dbName, 'books; DROP TABLE', 1);
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseError);
                expect((error as DatabaseError).code).toBe('OPERATION_FAILED');
            }
        });

        it('应该抛出错误当列名无效', async () => {
            await expect(softDelete(mockDb, dbName, 'books', 1, 'deleted_at; DROP')).rejects.toThrow(DatabaseError);
            try {
                await softDelete(mockDb, dbName, 'books', 1, 'deleted_at; DROP');
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseError);
                expect((error as DatabaseError).code).toBe('OPERATION_FAILED');
            }
        });
    });

    describe('hardDelete', () => {
        it('应该成功硬删除记录', async () => {
            vi.mocked(executor.executeUpdate).mockResolvedValue({
                rowsAffected: 1,
                lastInsertId: 0
            });

            await expect(hardDelete(mockDb, dbName, 'books', 1)).resolves.not.toThrow();
            expect(executor.executeUpdate).toHaveBeenCalledWith(
                mockDb,
                dbName,
                'DELETE FROM books WHERE id = ?',
                [1],
                expect.objectContaining({ operationName: 'hardDelete:books' })
            );
        });

        it('应该抛出错误当记录不存在', async () => {
            vi.mocked(executor.executeUpdate).mockResolvedValue({
                rowsAffected: 0,
                lastInsertId: 0
            });

            await expect(hardDelete(mockDb, dbName, 'books', 999)).rejects.toThrow(DatabaseError);
            try {
                await hardDelete(mockDb, dbName, 'books', 999);
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseError);
                expect((error as DatabaseError).code).toBe('RECORD_NOT_FOUND');
            }
        });

        it('应该抛出错误当表名无效', async () => {
            await expect(hardDelete(mockDb, dbName, 'books; DROP TABLE', 1)).rejects.toThrow(DatabaseError);
            try {
                await hardDelete(mockDb, dbName, 'books; DROP TABLE', 1);
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseError);
                expect((error as DatabaseError).code).toBe('OPERATION_FAILED');
            }
        });
    });

    describe('restoreDeleted', () => {
        it('应该成功恢复已删除的记录', async () => {
            vi.mocked(executor.executeUpdate).mockResolvedValue({
                rowsAffected: 1,
                lastInsertId: 0
            });

            await expect(restoreDeleted(mockDb, dbName, 'books', 1)).resolves.not.toThrow();
            expect(executor.executeUpdate).toHaveBeenCalledWith(
                mockDb,
                dbName,
                'UPDATE books SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
                [1],
                expect.objectContaining({ operationName: 'restore:books' })
            );
        });

        it('应该使用自定义 deletedAtColumn', async () => {
            vi.mocked(executor.executeUpdate).mockResolvedValue({
                rowsAffected: 1,
                lastInsertId: 0
            });

            await restoreDeleted(mockDb, dbName, 'books', 1, 'removed_at');
            expect(executor.executeUpdate).toHaveBeenCalledWith(
                mockDb,
                dbName,
                'UPDATE books SET removed_at = NULL WHERE id = ? AND removed_at IS NOT NULL',
                [1],
                expect.any(Object)
            );
        });

        it('应该抛出错误当记录不存在或未删除', async () => {
            vi.mocked(executor.executeUpdate).mockResolvedValue({
                rowsAffected: 0,
                lastInsertId: 0
            });

            await expect(restoreDeleted(mockDb, dbName, 'books', 999)).rejects.toThrow(DatabaseError);
            try {
                await restoreDeleted(mockDb, dbName, 'books', 999);
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseError);
                expect((error as DatabaseError).code).toBe('RECORD_NOT_FOUND');
            }
        });

        it('应该抛出错误当表名无效', async () => {
            await expect(restoreDeleted(mockDb, dbName, 'books; DROP TABLE', 1)).rejects.toThrow(DatabaseError);
            try {
                await restoreDeleted(mockDb, dbName, 'books; DROP TABLE', 1);
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseError);
                expect((error as DatabaseError).code).toBe('OPERATION_FAILED');
            }
        });

        it('应该抛出错误当列名无效', async () => {
            await expect(restoreDeleted(mockDb, dbName, 'books', 1, 'deleted_at; DROP')).rejects.toThrow(DatabaseError);
            try {
                await restoreDeleted(mockDb, dbName, 'books', 1, 'deleted_at; DROP');
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseError);
                expect((error as DatabaseError).code).toBe('OPERATION_FAILED');
            }
        });
    });

    describe('isDeleted', () => {
        it('应该返回 true 当记录已删除', async () => {
            vi.mocked(executor.executeSelect).mockResolvedValue([
                { deleted_at: Math.floor(Date.now() / 1000) }
            ]);

            const result = await isDeleted(mockDb, dbName, 'books', 1);
            expect(result).toBe(true);
            expect(executor.executeSelect).toHaveBeenCalledWith(
                mockDb,
                dbName,
                'SELECT deleted_at as deleted_at FROM books WHERE id = ?',
                [1],
                expect.objectContaining({ operationName: 'isDeleted:books' })
            );
        });

        it('应该返回 false 当记录未删除', async () => {
            vi.mocked(executor.executeSelect).mockResolvedValue([
                { deleted_at: null }
            ]);

            const result = await isDeleted(mockDb, dbName, 'books', 1);
            expect(result).toBe(false);
        });

        it('应该返回 false 当 deleted_at 为 0', async () => {
            vi.mocked(executor.executeSelect).mockResolvedValue([
                { deleted_at: 0 }
            ]);

            const result = await isDeleted(mockDb, dbName, 'books', 1);
            expect(result).toBe(false);
        });

        it('应该使用自定义 deletedAtColumn', async () => {
            vi.mocked(executor.executeSelect).mockResolvedValue([
                { deleted_at: Math.floor(Date.now() / 1000) }
            ]);

            await isDeleted(mockDb, dbName, 'books', 1, 'removed_at');
            expect(executor.executeSelect).toHaveBeenCalledWith(
                mockDb,
                dbName,
                'SELECT removed_at as deleted_at FROM books WHERE id = ?',
                [1],
                expect.any(Object)
            );
        });

        it('应该抛出错误当记录不存在', async () => {
            vi.mocked(executor.executeSelect).mockResolvedValue([]);

            await expect(isDeleted(mockDb, dbName, 'books', 999)).rejects.toThrow(DatabaseError);
            try {
                await isDeleted(mockDb, dbName, 'books', 999);
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseError);
                expect((error as DatabaseError).code).toBe('RECORD_NOT_FOUND');
            }
        });

        it('应该抛出错误当表名无效', async () => {
            await expect(isDeleted(mockDb, dbName, 'books; DROP TABLE', 1)).rejects.toThrow(DatabaseError);
            try {
                await isDeleted(mockDb, dbName, 'books; DROP TABLE', 1);
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseError);
                expect((error as DatabaseError).code).toBe('OPERATION_FAILED');
            }
        });

        it('应该抛出错误当列名无效', async () => {
            await expect(isDeleted(mockDb, dbName, 'books', 1, 'deleted_at; DROP')).rejects.toThrow(DatabaseError);
            try {
                await isDeleted(mockDb, dbName, 'books', 1, 'deleted_at; DROP');
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseError);
                expect((error as DatabaseError).code).toBe('OPERATION_FAILED');
            }
        });
    });
});

