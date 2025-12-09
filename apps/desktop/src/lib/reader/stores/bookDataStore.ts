/**
 * BookDataStore - 书籍数据存储
 * 管理书籍配置、元数据和搜索配置的持久化
 */

import { writable, type Writable, get } from 'svelte/store';
import type { Book } from '@cozy-reader/database';
import { BookService } from '@cozy-reader/database';
import type { BookDoc, BookConfig, BookNote, BookSearchConfig } from '../types';

/**
 * 书籍数据接口
 * 持久化数据，同一本书的不同视图共享
 */
export interface BookData {
    /** 书籍 ID */
    id: string;
    /** 书籍对象 */
    book: Book | null;
    /** 文件对象（如果可用） */
    file: File | null;
    /** 书籍配置 */
    config: BookConfig | null;
    /** 书籍文档对象 */
    bookDoc: BookDoc | null;
    /** 是否为固定布局 */
    isFixedLayout?: boolean;
}

/**
 * BookDataStore 状态接口
 */
interface BookDataStoreState {
    /** 书籍数据映射，key 为书籍 ID */
    booksData: Record<string, BookData>;
}

/**
 * 创建初始状态
 */
function createInitialState(): BookDataStoreState {
    return {
        booksData: {},
    };
}

/**
 * BookDataStore 类
 * 提供书籍数据管理和配置持久化
 */
class BookDataStore {
    private store: Writable<BookDataStoreState>;

    constructor() {
        const initialState = createInitialState();
        this.store = writable(initialState);
    }

    /**
     * 订阅状态变化
     */
    subscribe(callback: (state: BookDataStoreState) => void): () => void {
        return this.store.subscribe(callback);
    }

    /**
     * 从 bookKey 提取书籍 ID
     * bookKey 格式：bookId-viewIndex
     */
    private extractBookId(key: string): string {
        return key.split('-')[0] || '';
    }

    /**
     * 获取书籍数据
     */
    getBookData(keyOrId: string): BookData | null {
        const id = this.extractBookId(keyOrId);
        return get(this.store).booksData[id] || null;
    }

    /**
     * 设置书籍数据
     */
    setBookData(keyOrId: string, data: Partial<BookData>): void {
        const id = this.extractBookId(keyOrId);
        const existing = get(this.store).booksData[id] || {
            id,
            book: null,
            file: null,
            config: null,
            bookDoc: null,
        };

        this.store.update((state) => ({
            ...state,
            booksData: {
                ...state.booksData,
                [id]: {
                    ...existing,
                    ...data,
                },
            },
        }));
    }

    /**
     * 获取书籍配置
     */
    getConfig(key: string | null): BookConfig | null {
        if (!key) return null;
        const id = this.extractBookId(key);
        return get(this.store).booksData[id]?.config || null;
    }

    /**
     * 设置书籍配置（部分更新）
     */
    setConfig(key: string, partialConfig: Partial<BookConfig>): void {
        const id = this.extractBookId(key);
        const bookData = get(this.store).booksData[id];
        if (!bookData) {
            console.warn('No book data found for key:', key);
            return;
        }

        const config = bookData.config || {
            updatedAt: Date.now(),
        };

        this.store.update((state) => ({
            ...state,
            booksData: {
                ...state.booksData,
                [id]: {
                    ...bookData,
                    config: {
                        ...config,
                        ...partialConfig,
                        updatedAt: Date.now(),
                    },
                },
            },
        }));
    }

    /**
     * 保存配置到数据库
     */
    async saveConfig(key: string, config: BookConfig): Promise<void> {
        const id = this.extractBookId(key);
        const bookData = get(this.store).booksData[id];
        if (!bookData || !bookData.book) {
            console.warn('No book data found for saving config:', key);
            return;
        }

        try {
            const bookId = parseInt(id, 10);
            if (isNaN(bookId) || bookId <= 0) {
                console.error('Invalid book ID:', id);
                return;
            }

            // 更新配置时间戳
            const updatedConfig: BookConfig = {
                ...config,
                updatedAt: Date.now(),
            };

            // 转换为 ReadingProgress 格式保存
            const readingProgress = {
                location: updatedConfig.location,
                currentPage: updatedConfig.progress?.[0],
                totalPages: updatedConfig.progress?.[1],
            };

            await BookService.update(bookId, {
                currentProgress: readingProgress,
            });

            // 更新本地状态
            this.setConfig(key, updatedConfig);
        } catch (error) {
            console.error('Failed to save config to database:', error);
            throw error;
        }
    }

    /**
     * 更新笔记列表
     */
    updateBooknotes(key: string, booknotes: BookNote[]): BookConfig | undefined {
        const id = this.extractBookId(key);
        const bookData = get(this.store).booksData[id];
        if (!bookData) {
            console.warn('No book data found for updating booknotes:', key);
            return undefined;
        }

        // 去重：基于 id-type-cfi 组合
        const dedupedBooknotes = Array.from(
            new Map(
                booknotes.map((item) => [`${item.id}-${item.type}-${item.cfi}`, item])
            ).values()
        );

        const updatedConfig: BookConfig = {
            ...bookData.config,
            booknotes: dedupedBooknotes,
            updatedAt: Date.now(),
        };

        this.setConfig(key, updatedConfig);
        return updatedConfig;
    }

    /**
     * 更新搜索配置
     */
    setSearchConfig(key: string, searchConfig: Partial<BookSearchConfig>): void {
        const id = this.extractBookId(key);
        const bookData = get(this.store).booksData[id];
        if (!bookData) {
            console.warn('No book data found for setting search config:', key);
            return;
        }

        const config = bookData.config || { updatedAt: Date.now() };
        this.setConfig(key, {
            ...config,
            searchConfig: {
                ...config.searchConfig,
                ...searchConfig,
            },
        });
    }

    /**
     * 获取搜索配置
     */
    getSearchConfig(key: string): BookSearchConfig | null {
        const config = this.getConfig(key);
        return (config?.searchConfig as BookSearchConfig) || null;
    }

    /**
     * 清除书籍数据
     */
    clearBookData(keyOrId: string): void {
        const id = this.extractBookId(keyOrId);
        this.store.update((state) => {
            const { [id]: _, ...rest } = state.booksData;
            return {
                ...state,
                booksData: rest,
            };
        });
    }
}

export const bookDataStore = new BookDataStore();
