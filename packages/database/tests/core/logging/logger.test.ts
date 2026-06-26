import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    getDatabaseLogger,
    logDatabaseError,
    logDatabaseWarn,
    setDatabaseLogger,
    type DatabaseLogger
} from '../../../src/core/logging';

describe('database logger', () => {
    const logger: DatabaseLogger = {
        warn: vi.fn(),
        error: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        setDatabaseLogger(undefined);
    });

    it('默认使用空实现', () => {
        expect(() => logDatabaseWarn('warning')).not.toThrow();
        expect(() => logDatabaseError('error')).not.toThrow();
    });

    it('可以注入自定义日志器', () => {
        setDatabaseLogger(logger);

        expect(getDatabaseLogger()).toBe(logger);

        logDatabaseWarn('warning', { id: 1 });
        logDatabaseError('error', new Error('boom'));

        expect(logger.warn).toHaveBeenCalledWith('warning', { id: 1 });
        expect(logger.error).toHaveBeenCalledWith('error', expect.any(Error));
    });

    it('日志器自身抛错时不影响主流程', () => {
        setDatabaseLogger({
            warn: () => {
                throw new Error('warn failed');
            },
            error: () => {
                throw new Error('error failed');
            }
        });

        expect(() => logDatabaseWarn('warning')).not.toThrow();
        expect(() => logDatabaseError('error')).not.toThrow();
    });
});
