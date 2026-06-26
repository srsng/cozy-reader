import { describe, expect, it, vi } from 'vitest';
import { createDeferredInvalidation } from './deferredInvalidation';

describe('createDeferredInvalidation', () => {
    it('defer callback to the next microtask', async () => {
        const callback = vi.fn();
        const invalidation = createDeferredInvalidation(callback);

        invalidation.schedule();

        expect(callback).not.toHaveBeenCalled();

        await Promise.resolve();

        expect(callback).toHaveBeenCalledOnce();
    });

    it('coalesces repeated schedules in one microtask', async () => {
        const callback = vi.fn();
        const invalidation = createDeferredInvalidation(callback);

        invalidation.schedule();
        invalidation.schedule();
        invalidation.schedule();

        await Promise.resolve();

        expect(callback).toHaveBeenCalledOnce();
    });

    it('stops invoking callbacks after disposal', async () => {
        const callback = vi.fn();
        const invalidation = createDeferredInvalidation(callback);

        invalidation.schedule();
        invalidation.dispose();

        await Promise.resolve();

        expect(callback).not.toHaveBeenCalled();
    });
});
