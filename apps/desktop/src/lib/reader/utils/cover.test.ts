import { describe, expect, it, vi } from 'vitest';
import type { BookDoc } from '../types';
import { blobToDataUrl, extractCoverDataUrl } from './cover';

describe('cover utils', () => {
    it('应该将封面 Blob 编码为 data URL', async () => {
        const blob = new Blob(['cover'], { type: 'image/jpeg' });

        await expect(blobToDataUrl(blob)).resolves.toBe('data:image/jpeg;base64,Y292ZXI=');
    });

    it('应该在 Blob 没有 MIME 类型时使用 image/png', async () => {
        const blob = new Blob(['cover']);

        await expect(blobToDataUrl(blob)).resolves.toBe('data:image/png;base64,Y292ZXI=');
    });

    it('应该在文档没有封面时返回 null', async () => {
        const bookDoc = {
            getCover: vi.fn().mockResolvedValue(null)
        } as unknown as BookDoc;

        await expect(extractCoverDataUrl(bookDoc)).resolves.toBeNull();
        expect(bookDoc.getCover).toHaveBeenCalledTimes(1);
    });
});
