import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type Database from '@tauri-apps/plugin-sql';
import { DatabaseError } from '../../../src/core/errors';
import { setDatabaseLogger } from '../../../src/core/logging';
import { Transaction } from '../../../src/core/database/transaction';

describe('Transaction', () => {
    const logger = {
        warn: vi.fn(),
        error: vi.fn()
    };

    const db = {
        execute: vi.fn()
    } as unknown as Database;

    beforeEach(() => {
        vi.clearAllMocks();
        setDatabaseLogger(logger);
    });

    afterEach(() => {
        setDatabaseLogger(undefined);
    });

    it('回滚失败时会记录错误并保留原始事务错误', async () => {
        vi.mocked(db.execute).mockImplementation(async (sql: string) => {
            if (sql === 'ROLLBACK') {
                throw new Error('rollback failed');
            }

            return {
                rowsAffected: 0,
                lastInsertId: 0
            };
        });

        const transaction = new Transaction(db);

        const error = await transaction.run(async () => {
            throw new Error('boom');
        }).catch((value: unknown) => value);

        expect(error).toBeInstanceOf(DatabaseError);
        expect(error).toMatchObject({
            name: 'DatabaseError',
            code: 'TRANSACTION_FAILED',
            message: 'Transaction failed: boom'
        });

        expect(logger.error).toHaveBeenCalledWith(
            'Failed to rollback transaction:',
            expect.any(Error)
        );
    });
});
