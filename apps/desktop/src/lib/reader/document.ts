import type { BookFormat, BookDoc } from './types';
import * as epubcfi from 'foliate-js/epubcfi.js';

// groupBy polyfill for foliate-js
Object.groupBy ??= (iterable: any, callbackfn: any) => {
    const obj = Object.create(null);
    let i = 0;
    for (const value of iterable) {
        const key = callbackfn(value, i++);
        if (key in obj) {
            obj[key].push(value);
        } else {
            obj[key] = [value];
        }
    }
    return obj;
};

Map.groupBy ??= (iterable: any, callbackfn: any) => {
    const map = new Map();
    let i = 0;
    for (const value of iterable) {
        const key = callbackfn(value, i++);
        const list = map.get(key);
        if (list) {
            list.push(value);
        } else {
            map.set(key, [value]);
        }
    }
    return map;
};

export const CFI = epubcfi;

/**
 * ZIP 条目接口
 */
interface ZipEntry {
    filename: string;
    uncompressedSize?: number;
    getData?(writer: unknown): Promise<string | Blob> | null;
}

/**
 * ZIP 加载器接口
 */
interface ZipLoader {
    entries: ZipEntry[];
    loadText(name: string): Promise<string | null>;
    loadBlob(name: string, type?: string): Promise<Blob | null>;
    getSize(name: string): number;
    getComment(): Promise<string | null>;
    sha1?: string;
}

/**
 * DocumentLoader - 统一处理多种电子书格式
 */
export class DocumentLoader {
    private file: File;

    constructor(file: File) {
        this.file = file;
    }

    /**
     * 检测是否为 ZIP 文件
     */
    private async isZip(): Promise<boolean> {
        const arr = new Uint8Array(await this.file.slice(0, 4).arrayBuffer());
        return arr[0] === 0x50 && arr[1] === 0x4b && arr[2] === 0x03 && arr[3] === 0x04;
    }

    /**
     * 检测是否为 PDF 文件
     */
    private async isPDF(): Promise<boolean> {
        const arr = new Uint8Array(await this.file.slice(0, 5).arrayBuffer());
        return (
            arr[0] === 0x25 &&
            arr[1] === 0x50 &&
            arr[2] === 0x44 &&
            arr[3] === 0x46 &&
            arr[4] === 0x2d
        );
    }

    /**
     * 创建 ZIP 加载器
     */
    private async makeZipLoader(): Promise<ZipLoader> {
        const getComment = async (): Promise<string | null> => {
            const EOCD_SIGNATURE = [0x50, 0x4b, 0x05, 0x06];
            const maxEOCDSearch = 1024 * 64;

            const sliceSize = Math.min(maxEOCDSearch, this.file.size);
            const tail = await this.file
                .slice(this.file.size - sliceSize, this.file.size)
                .arrayBuffer();
            const bytes = new Uint8Array(tail);

            for (let i = bytes.length - 22; i >= 0; i--) {
                if (
                    bytes[i] === EOCD_SIGNATURE[0] &&
                    bytes[i + 1] === EOCD_SIGNATURE[1] &&
                    bytes[i + 2] === EOCD_SIGNATURE[2] &&
                    bytes[i + 3] === EOCD_SIGNATURE[3]
                ) {
                    const commentLength = bytes[i + 20]! + (bytes[i + 21]! << 8);
                    const commentStart = i + 22;
                    const commentBytes = bytes.slice(commentStart, commentStart + commentLength);
                    return new TextDecoder().decode(commentBytes);
                }
            }

            return null;
        };

        // 使用 foliate-js 内置的 zip.js
        const { configure, ZipReader, BlobReader, TextWriter, BlobWriter } = await import(
            'foliate-js/vendor/zip.js'
        );
        configure({ useWebWorkers: false });
        const reader = new ZipReader(new BlobReader(this.file));
        const entries = (await reader.getEntries()) as ZipEntry[];
        const map = new Map(entries.map((entry) => [entry.filename, entry]));
        const loadText = async (name: string): Promise<string | null> => {
            const entry = map.get(name);
            if (!entry || !entry.getData) return null;
            const result = await entry.getData(new TextWriter());
            return typeof result === 'string' ? result : null;
        };

        const loadBlob = async (name: string, type?: string): Promise<Blob | null> => {
            const entry = map.get(name);
            if (!entry || !entry.getData) return null;
            const result = await entry.getData(new BlobWriter(type!));
            return result instanceof Blob ? result : null;
        };

        const getSize = (name: string) => map.get(name)?.uncompressedSize ?? 0;

        return { entries, loadText, loadBlob, getSize, getComment, sha1: undefined };
    }

    /**
     * 检测是否为 CBZ 文件
     */
    private isCBZ(): boolean {
        return (
            this.file.type === 'application/vnd.comicbook+zip' || this.file.name.endsWith('.cbz')
        );
    }

    /**
     * 检测是否为 FB2 文件
     */
    private isFB2(): boolean {
        return (
            this.file.type === 'application/x-fictionbook+xml' || this.file.name.endsWith('.fb2')
        );
    }

    /**
     * 检测是否为 FBZ 文件
     */
    private isFBZ(): boolean {
        return (
            this.file.type === 'application/x-zip-compressed-fb2' ||
            this.file.name.endsWith('.fb2.zip') ||
            this.file.name.endsWith('.fbz')
        );
    }

    /**
     * 打开并解析文件
     */
    public async open(): Promise<{ book: BookDoc; format: BookFormat }> {
        let book: BookDoc | null = null;
        let format: BookFormat = 'epub';

        if (!this.file.size) {
            throw new Error('File is empty');
        }

        if (await this.isZip()) {
            const loader = await this.makeZipLoader();
            const { entries } = loader;

            if (this.isCBZ()) {
                const { makeComicBook } = await import('foliate-js/comic-book.js');
                const comicBook = await makeComicBook(loader, this.file);
                // 确保有 dir 属性
                const comicBookWithDir = comicBook as unknown as BookDoc;
                if (!comicBookWithDir.dir) {
                    comicBookWithDir.dir = 'ltr';
                }
                book = comicBookWithDir;
                format = 'cbz';
            } else if (this.isFBZ()) {
                const entry = entries.find((entry) => entry.filename.endsWith('.fb2'));
                const blob = await loader.loadBlob((entry ?? entries[0]!).filename);
                if (!blob) {
                    throw new Error('Failed to load FB2 file');
                }
                const { makeFB2 } = await import('foliate-js/fb2.js');
                const fb2Book = await makeFB2(blob);
                // 确保有 dir 属性
                const fb2BookWithDir = fb2Book as unknown as BookDoc;
                if (!fb2BookWithDir.dir) {
                    fb2BookWithDir.dir = 'ltr';
                }
                book = fb2BookWithDir;
                format = 'fbz';
            } else {
                const { EPUB } = await import('foliate-js/epub.js');
                // 参考 readest: sha1 可以是 undefined，使用类型断言
                const epub = await new EPUB(loader as any).init();
                // EPUB 应该有 dir 属性，但确保类型正确
                const epubWithDir = epub as unknown as BookDoc;
                if (!epubWithDir.dir) {
                    epubWithDir.dir = 'ltr';
                }
                book = epubWithDir;
                format = 'epub';
            }
        } else if (await this.isPDF()) {
            const { makePDF } = await import('foliate-js/pdf.js');
            const pdfBook = await makePDF(this.file);
            // PDF 需要包装成 BookDoc 格式
            book = {
                ...pdfBook,
                dir: 'ltr',
                metadata: {
                    title: this.file.name
                }
            } as unknown as BookDoc;
            format = 'pdf';
        } else if (await (await import('foliate-js/mobi.js')).isMOBI(this.file)) {
            const fflate = await import('foliate-js/vendor/fflate.js');
            const { MOBI } = await import('foliate-js/mobi.js');
            const mobiBook = await new MOBI({ unzlib: fflate.unzlibSync }).open(this.file);
            // 转换为 BookDoc 类型
            const mobiBookWithDir = mobiBook as unknown as BookDoc;
            // 确保有 dir 属性
            if (!mobiBookWithDir.dir) {
                mobiBookWithDir.dir = 'ltr';
            }
            // 确保 rendition.layout 类型正确
            if (mobiBookWithDir.rendition && typeof mobiBookWithDir.rendition.layout === 'string') {
                const layout = mobiBookWithDir.rendition.layout;
                if (layout === 'pre-paginated' || layout === 'reflowable') {
                    mobiBookWithDir.rendition.layout = layout;
                } else {
                    mobiBookWithDir.rendition.layout = 'reflowable';
                }
            }
            book = mobiBookWithDir;
            const ext = this.file.name.split('.').pop()?.toLowerCase();
            switch (ext) {
                case 'azw':
                    format = 'azw';
                    break;
                case 'azw3':
                    format = 'azw3';
                    break;
                default:
                    format = 'mobi';
            }
        } else if (this.isFB2()) {
            const { makeFB2 } = await import('foliate-js/fb2.js');
            const fb2Book = await makeFB2(this.file);
            // 确保有 dir 属性
            const fb2BookWithDir = fb2Book as unknown as BookDoc;
            if (!fb2BookWithDir.dir) {
                fb2BookWithDir.dir = 'ltr';
            }
            book = fb2BookWithDir;
            format = 'fb2';
        }

        if (!book) {
            throw new Error('Unsupported file type');
        }

        return { book, format };
    }
}

/**
 * 从文档获取文本方向
 */
export const getDirection = (doc: Document) => {
    const { defaultView } = doc;
    if (!defaultView) {
        return { vertical: false, rtl: false };
    }
    const { writingMode, direction } = defaultView.getComputedStyle(doc.body);
    const vertical = writingMode === 'vertical-rl' || writingMode === 'vertical-lr';
    const rtl = doc.body.dir === 'rtl' || direction === 'rtl' || doc.documentElement.dir === 'rtl';
    return { vertical, rtl };
};
