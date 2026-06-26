import { describe, expect, it } from 'vitest';
import { resolveMarkdownImageSource, shouldUseTauriAssetProtocol } from './image-utils';

describe('resolveMarkdownImageSource', () => {
    it('resolves dot-relative images from a Windows markdown file directory', () => {
        expect(
            resolveMarkdownImageSource(
                './public/screenshot.png',
                'X:\\cozy-reader-fixture\\README.md'
            )
        ).toBe('X:\\cozy-reader-fixture\\public\\screenshot.png');
    });

    it('resolves parent-relative images from a nested Windows markdown file', () => {
        expect(
            resolveMarkdownImageSource('../assets/a.png', 'D:\\books\\docs\\chapter\\README.md')
        ).toBe('D:\\books\\docs\\assets\\a.png');
    });

    it('resolves plain relative images from a POSIX markdown file directory', () => {
        expect(
            resolveMarkdownImageSource(
                'public/screenshot.png',
                '/cozy-reader-fixture/book/README.md'
            )
        ).toBe(
            '/cozy-reader-fixture/book/public/screenshot.png'
        );
    });

    it('keeps absolute local paths as local paths', () => {
        expect(
            resolveMarkdownImageSource(
                'X:\\cozy-reader-fixture\\images\\cover.png',
                '/cozy-reader-fixture/book/README.md'
            )
        ).toBe(
            'X:\\cozy-reader-fixture\\images\\cover.png'
        );
    });

    it('keeps URL-like image sources unchanged', () => {
        expect(
            resolveMarkdownImageSource(
                'https://example.com/image.png',
                '/cozy-reader-fixture/book.md'
            )
        ).toBe('https://example.com/image.png');
        expect(
            resolveMarkdownImageSource(
                'data:image/png;base64,abc',
                '/cozy-reader-fixture/book.md'
            )
        ).toBe('data:image/png;base64,abc');
        expect(
            resolveMarkdownImageSource('blob:http://localhost/id', '/cozy-reader-fixture/book.md')
        ).toBe('blob:http://localhost/id');
    });
});

describe('shouldUseTauriAssetProtocol', () => {
    it('uses Tauri asset protocol only for local paths', () => {
        expect(shouldUseTauriAssetProtocol('X:\\cozy-reader-fixture\\images\\cover.png')).toBe(
            true
        );
        expect(shouldUseTauriAssetProtocol('/cozy-reader-fixture/book/public/screenshot.png')).toBe(
            true
        );
        expect(shouldUseTauriAssetProtocol('https://example.com/image.png')).toBe(false);
        expect(shouldUseTauriAssetProtocol('data:image/png;base64,abc')).toBe(false);
        expect(shouldUseTauriAssetProtocol('blob:http://localhost/id')).toBe(false);
        expect(shouldUseTauriAssetProtocol('asset://localhost/image.png')).toBe(false);
    });
});
