/**
 * ReaderStore - 阅读器状态管理
 * 管理当前打开的书籍视图状态、进度、设置等
 */

import { writable, type Writable, get } from 'svelte/store';
import type { Book, ReadingProgress } from '@cozy-reader/database';
import { BookService } from '@cozy-reader/database';
import type {
    BookDoc,
    BookProgress,
    FoliateViewElement,
    TOCItem,
    PageInfo,
    TimeInfo,
    BookConfig,
} from '../types';
import { getDefaultReaderSettings } from '../constants';
import { DocumentService } from '../services/DocumentService';
import { bookDataStore } from './bookDataStore';
import type { ReaderSettings } from '../settings';
import { READER_SETTINGS } from './readerSettings';
import { inject } from '$lib/utils/context';

/**
 * 视图状态接口
 */
export interface ViewState {
    /** 唯一键，格式：bookId-viewIndex */
    key: string;
    /** foliate-view 元素实例 */
    view: FoliateViewElement | null;
    /** 是否为主要的视图（用于保存设置） */
    isPrimary: boolean;
    /** 是否正在加载 */
    loading: boolean;
    /** 是否已初始化 */
    inited: boolean;
    /** 错误信息 */
    error: string | null;
    /** 阅读进度 */
    progress: BookProgress | null;
    /** 书签/标注侧边栏是否可见 */
    ribbonVisible: boolean;
    /** TTS 是否启用 */
    ttsEnabled: boolean;
    /** 阅读器设置（合并了全局设置和书籍特定设置） */
    readerSettings: ReaderSettings | null;
    /** 书籍文档对象 */
    bookDoc: BookDoc | null;
    /** 网格边距 */
    gridInsets: Insets | null;
}

/**
 * 边距接口
 */
export interface Insets {
    /** 上边距 */
    top: number;
    /** 右边距 */
    right: number;
    /** 下边距 */
    bottom: number;
    /** 左边距 */
    left: number;
}

/**
 * ReaderStore 状态接口
 */
interface ReaderStoreState {
    /** 所有视图状态，key 为视图键 */
    viewStates: Record<string, ViewState>;
    /** 当前打开的书籍 ID 列表 */
    bookKeys: string[];
    /** 当前悬停的书籍键 */
    hoveredBookKey: string | null;
}

/**
 * 创建初始状态
 */
const InitialState: ReaderStoreState = {

    viewStates: {},
    bookKeys: [],
    hoveredBookKey: null,
} as const;

/**
 * ReaderStore 类
 * 提供状态管理和操作方法
 */
class ReaderStore {
    private store: Writable<ReaderStoreState>;
    private progressSaveTimer: ReturnType<typeof setTimeout> | null = null;
    private settingsSaveTimer: ReturnType<typeof setTimeout> | null = null;
    private readonly DEBOUNCE_DELAY = 10000; // 10秒防抖

    constructor() {
        const initialState = { ...InitialState };
        this.store = writable(initialState);
    }

    /**
     * 订阅状态变化
     */
    subscribe(callback: (state: ReaderStoreState) => void): () => void {
        return this.store.subscribe(callback);
    }

    /**
     * 设置书籍键列表
     */
    setBookKeys(keys: string[]): void {
        this.store.update((state) => ({
            ...state,
            bookKeys: keys,
        }));
    }

    /**
     * 获取书籍键列表
     */
    getBookKeys(): string[] {
        return get(this.store).bookKeys;
    }

    /**
     * 将 BookProgress 转换为 ReadingProgress
     */
    private convertToReadingProgress(progress: BookProgress): ReadingProgress {
        const { pageinfo, location, sectionHref, sectionLabel, sectionId } = progress;
        const percentage = pageinfo.total > 0 ? (pageinfo.current / pageinfo.total) * 100 : 0;

        return {
            location,
            sectionHref,
            sectionLabel,
            sectionId,
            currentPage: pageinfo.current,
            totalPages: pageinfo.total,
            nextPage: pageinfo.next,
            percentage,
            section: {
                current: progress.section.current,
                next: progress.section.next,
                total: progress.section.total,
            },
            timeinfo: {
                section: progress.timeinfo.section,
                total: progress.timeinfo.total,
            },
        };
    }

    /**
     * 保存进度到数据库（防抖）
     */
    private async saveProgressToDatabase(bookId: number, progress: BookProgress): Promise<void> {
        if (this.progressSaveTimer) {
            clearTimeout(this.progressSaveTimer);
        }

        this.progressSaveTimer = setTimeout(async () => {
            try {
                const readingProgress = this.convertToReadingProgress(progress);
                const now = Math.floor(Date.now() / 1000); // Unix 时间戳（秒）

                console.log('Saving progress to database:', { bookId, location: readingProgress.location, currentPage: readingProgress.currentPage, totalPages: readingProgress.totalPages });

                await BookService.update(bookId, {
                    currentProgress: readingProgress,
                    lastReadAt: now,
                });

                console.log('Progress saved successfully');
            } catch (error) {
                console.error('Failed to save progress to database:', error);
            } finally {
                this.progressSaveTimer = null;
            }
        }, this.DEBOUNCE_DELAY);
    }

    /**
     * 合并全局设置和书籍特定设置
     */
    private mergeReaderSettings(
        global: ReaderSettings,
        bookSpecific?: Partial<ReaderSettings>
    ): ReaderSettings {
        if (!bookSpecific || Object.keys(bookSpecific).length === 0) {
            return global;
        }
        return { ...global, ...bookSpecific };
    }

    /**
     * 保存设置到数据库（防抖）
     * 只保存与全局设置不同的字段
     */
    private async saveSettingsToDatabase(
        bookId: number,
        readerSettings: ReaderSettings,
        bookConfig: BookConfig,
        globalReaderSettings?: ReaderSettings,
    ): Promise<void> {
        if (this.settingsSaveTimer) {
            clearTimeout(this.settingsSaveTimer);
        }

        this.settingsSaveTimer = setTimeout(async () => {
            try {
                // 如果没有提供全局设置，使用默认设置
                const finalGlobalReaderSettings = globalReaderSettings || getDefaultReaderSettings(false, false);
                const bookIdStr = String(bookId);

                // 计算差异：只保存与全局设置不同的字段
                const bookSpecific: Partial<ReaderSettings> = {};
                for (const key in readerSettings) {
                    if ((readerSettings as any)[key] !== (finalGlobalReaderSettings as any)[key]) {
                        (bookSpecific as any)[key] = (readerSettings as any)[key];
                    }
                }

                const updatedConfig: BookConfig = {
                    ...bookConfig,
                    readerSettings: Object.keys(bookSpecific).length > 0 ? bookSpecific : undefined,
                    updatedAt: Date.now(),
                };

                // 更新 BookDataStore
                bookDataStore.setBookData(bookIdStr, { config: updatedConfig });

                // 保存到数据库
                await bookDataStore.saveConfig(bookIdStr, updatedConfig);

                // 同时更新数据库中的 readerSettings 字段
                await BookService.update(bookId, {
                    readerSettings: Object.keys(bookSpecific).length > 0 ? bookSpecific : {},
                } as any);
            } catch (error) {
                console.error('Failed to save settings to database:', error);
            } finally {
                this.settingsSaveTimer = null;
            }
        }, this.DEBOUNCE_DELAY);
    }

    /**
     * 设置悬停的书籍键
     */
    setHoveredBookKey(key: string | null): void {
        this.store.update((state) => ({
            ...state,
            hoveredBookKey: key,
        }));
    }

    /**
     * 获取悬停的书籍键
     */
    getHoveredBookKey(): string | null {
        return get(this.store).hoveredBookKey;
    }

    /**
     * 获取视图状态
     */
    getViewState(key: string): ViewState | null {
        return get(this.store).viewStates[key] || null;
    }

    /**
     * 获取视图实例
     */
    getView(key: string | null): FoliateViewElement | null {
        if (!key) return null;
        const viewState = this.getViewState(key);
        return viewState?.view || null;
    }

    /**
     * 获取所有视图实例
     */
    getViews(): FoliateViewElement[] {
        return Object.values(get(this.store).viewStates)
            .map((vs) => vs.view)
            .filter((v): v is FoliateViewElement => v !== null);
    }

    /**
     * 根据书籍 ID 获取所有视图
     */
    getViewsById(bookId: string): FoliateViewElement[] {
        return Object.values(get(this.store).viewStates)
            .filter((vs) => vs.key.startsWith(`${bookId}-`))
            .map((vs) => vs.view)
            .filter((v): v is FoliateViewElement => v !== null);
    }

    /**
     * 设置视图实例
     */
    setView(key: string, view: FoliateViewElement): void {
        this.store.update((state) => {
            const viewState = state.viewStates[key];
            if (!viewState) return state;

            return {
                ...state,
                viewStates: {
                    ...state.viewStates,
                    [key]: {
                        ...viewState,
                        view,
                    },
                },
            };
        });
    }

    /**
     * 设置视图初始化状态
     */
    setViewInited(key: string, inited: boolean): void {
        this.store.update((state) => {
            const viewState = state.viewStates[key];
            if (!viewState) return state;

            return {
                ...state,
                viewStates: {
                    ...state.viewStates,
                    [key]: {
                        ...viewState,
                        inited,
                    },
                },
            };
        });
    }

    /**
     * 设置书签侧边栏可见性
     */
    setBookmarkRibbonVisibility(key: string, visible: boolean): void {
        this.store.update((state) => {
            const viewState = state.viewStates[key];
            if (!viewState) return state;

            return {
                ...state,
                viewStates: {
                    ...state.viewStates,
                    [key]: {
                        ...viewState,
                        ribbonVisible: visible,
                    },
                },
            };
        });
    }

    /**
     * 设置 TTS 启用状态
     */
    setTTSEnabled(key: string, enabled: boolean): void {
        this.store.update((state) => {
            const viewState = state.viewStates[key];
            if (!viewState) return state;

            return {
                ...state,
                viewStates: {
                    ...state.viewStates,
                    [key]: {
                        ...viewState,
                        ttsEnabled: enabled,
                    },
                },
            };
        });
    }

    /**
     * 获取阅读器设置
     */
    getReaderSettings(key: string): ReaderSettings | null {
        const viewState = this.getViewState(key);
        return viewState?.readerSettings || null;
    }

    /**
     * 设置阅读器设置
     * 如果是主视图，设置会被保存到书籍配置中
     * @param key 视图键
     * @param readerSettings 阅读器设置
     * @param saveToDatabase 是否保存到数据库，默认 true
     */
    setReaderSettings(key: string, readerSettings: ReaderSettings, saveToDatabase: boolean = true): void {
        this.store.update((state) => {
            const viewState = state.viewStates[key];
            if (!viewState) return state;

            // 如果是主视图且需要保存，保存到数据库
            if (saveToDatabase && viewState.isPrimary) {
                const bookIdStr = String(parseInt(key.split('-')[0] || '0', 10));
                const bookData = bookDataStore.getBookData(bookIdStr);
                const bookConfig = bookData?.config;

                if (bookConfig && bookIdStr && bookIdStr !== '0') {
                    const bookId = parseInt(bookIdStr, 10);
                    if (bookId > 0) {
                        // 获取全局设置（如果可用）
                        let globalReaderSettings: ReaderSettings | undefined;
                        try {
                            // 尝试从注入的 store 获取（如果可用）
                            const store = inject(READER_SETTINGS);
                            if (store) {
                                const unsubscribe = store.subscribe((value) => {
                                    globalReaderSettings = value;
                                });
                                unsubscribe();
                            }
                        } catch {
                            // 如果注入失败，使用默认设置
                        }
                        this.saveSettingsToDatabase(bookId, readerSettings, bookConfig, globalReaderSettings).catch(
                            (error) => {
                                console.error('Failed to save settings:', error);
                            },
                        );
                    }
                }
            }

            return {
                ...state,
                viewStates: {
                    ...state.viewStates,
                    [key]: {
                        ...viewState,
                        readerSettings,
                    },
                },
            };
        });
    }

    /**
     * 保存书籍特定的单个设置项到数据库
     * 只保存用户明确修改的字段，不保存整个 ReaderSettings
     * 如果值与全局设置相同，则删除该字段（不保存）
     * @param bookKey 书籍键
     * @param settingKey 设置项的键
     * @param value 设置项的值
     * @param globalReaderSettings 全局 ReaderSettings，用于比较是否需要保存
     */
    async saveBookReaderSetting<K extends keyof ReaderSettings>(
        bookKey: string,
        settingKey: K,
        value: ReaderSettings[K],
        globalReaderSettings?: ReaderSettings,
    ): Promise<void> {
        const viewState = this.getViewState(bookKey);
        if (!viewState || !viewState.isPrimary) return;

        const bookIdStr = String(parseInt(bookKey.split('-')[0] || '0', 10));
        const bookData = bookDataStore.getBookData(bookIdStr);
        const bookConfig = bookData?.config;

        if (!bookConfig || bookIdStr === '0') return;

        const bookId = parseInt(bookIdStr, 10);
        if (bookId <= 0) return;

        // 如果提供了全局设置，检查值是否与全局设置相同
        if (globalReaderSettings) {
            const globalValue = globalReaderSettings[settingKey];
            // 使用深度比较
            if (JSON.stringify(value) === JSON.stringify(globalValue)) {
                // 值与全局设置相同，删除这个字段（不保存书籍特定设置）
                const currentBookSettings = bookConfig.readerSettings || {};
                const { [settingKey]: _, ...restSettings } = currentBookSettings;

                // 如果删除后没有其他字段，则删除整个 readerSettings
                const updatedBookSettings = Object.keys(restSettings).length > 0 ? restSettings : undefined;

                const updatedConfig: BookConfig = {
                    ...bookConfig,
                    readerSettings: updatedBookSettings,
                    updatedAt: Date.now(),
                };

                // 更新 BookDataStore
                bookDataStore.setBookData(bookIdStr, { config: updatedConfig });

                // 保存到数据库（防抖）
                if (this.settingsSaveTimer) {
                    clearTimeout(this.settingsSaveTimer);
                }

                this.settingsSaveTimer = setTimeout(async () => {
                    try {
                        await bookDataStore.saveConfig(bookIdStr, updatedConfig);
                        await BookService.update(bookId, {
                            readerSettings: updatedBookSettings || {},
                        } as any);
                    } catch (error) {
                        console.error('Failed to save book setting to database:', error);
                    } finally {
                        this.settingsSaveTimer = null;
                    }
                }, this.DEBOUNCE_DELAY);

                // 更新运行时状态（使用全局设置）
                const updatedReaderSettings: ReaderSettings = {
                    ...viewState.readerSettings!,
                    [settingKey]: value,
                };
                this.setReaderSettings(bookKey, updatedReaderSettings, false); // 不保存到数据库，因为已经保存了
                return;
            }
        }

        // 值与全局设置不同，保存这个字段
        const updatedConfig: BookConfig = {
            ...bookConfig,
            readerSettings: {
                ...bookConfig.readerSettings,
                [settingKey]: value,
            },
            updatedAt: Date.now(),
        };

        // 更新 BookDataStore
        bookDataStore.setBookData(bookIdStr, { config: updatedConfig });

        // 保存到数据库（防抖）
        if (this.settingsSaveTimer) {
            clearTimeout(this.settingsSaveTimer);
        }

        this.settingsSaveTimer = setTimeout(async () => {
            try {
                await bookDataStore.saveConfig(bookIdStr, updatedConfig);
                await BookService.update(bookId, {
                    readerSettings: updatedConfig.readerSettings || {},
                } as any);
            } catch (error) {
                console.error('Failed to save book setting to database:', error);
            } finally {
                this.settingsSaveTimer = null;
            }
        }, this.DEBOUNCE_DELAY);

        // 更新运行时状态
        const currentReaderSettings = viewState.readerSettings;
        if (currentReaderSettings) {
            const updatedReaderSettings: ReaderSettings = {
                ...currentReaderSettings,
                [settingKey]: value,
            };
            this.setReaderSettings(bookKey, updatedReaderSettings, false); // 不保存到数据库，因为已经保存了
        }
    }

    /**
     * 获取阅读进度
     */
    getProgress(key: string): BookProgress | null {
        const viewState = this.getViewState(key);
        return viewState?.progress || null;
    }

    /**
     * 设置阅读进度
     */
    setProgress(
        key: string,
        location: string,
        tocItem: TOCItem | null,
        section: PageInfo,
        pageinfo: PageInfo,
        timeinfo: TimeInfo,
        range?: Range,
    ): void {
        this.store.update((state) => {
            const viewState = state.viewStates[key];
            if (!viewState) return state;

            const progress: BookProgress = {
                location,
                sectionId: tocItem?.id ?? 0,
                sectionHref: tocItem?.href ?? '',
                sectionLabel: tocItem?.label ?? '',
                section,
                pageinfo,
                timeinfo,
                range,
            };

            // 只在 isPrimary 时更新 bookData.config（参考 readest 架构）
            if (viewState.isPrimary) {
                const bookIdStr = String(parseInt(key.split('-')[0] || '0', 10));
                if (bookIdStr && bookIdStr !== '0') {
                    const bookData = bookDataStore.getBookData(bookIdStr);
                    if (bookData) {
                        // 检查位置或进度是否真正变化，避免不必要的更新
                        const currentLocation = bookData.config?.location;
                        const currentProgress = bookData.config?.progress;
                        const newProgress = pageinfo.total > 0 ? [pageinfo.current, pageinfo.total] as [number, number] : undefined;

                        const locationChanged = currentLocation !== location;
                        const progressChanged =
                            !currentProgress ||
                            !newProgress ||
                            currentProgress[0] !== newProgress[0] ||
                            currentProgress[1] !== newProgress[1];

                        // 只在位置或进度真正变化时才更新
                        if (locationChanged || progressChanged) {
                            const updatedConfig: BookConfig = {
                                ...(bookData.config || { updatedAt: Date.now() }),
                                location: location,
                                progress: newProgress,
                                updatedAt: Date.now(),
                            };
                            bookDataStore.setBookData(bookIdStr, { config: updatedConfig });
                            // 异步保存到数据库
                            bookDataStore.saveConfig(bookIdStr, updatedConfig).catch((error) => {
                                console.error('Failed to save config:', error);
                            });
                        }
                    }
                }

                // 保存进度到数据库
                const bookId = parseInt(key.split('-')[0] || '0', 10);
                if (bookId > 0) {
                    this.saveProgressToDatabase(bookId, progress).catch((error) => {
                        console.error('Failed to save progress:', error);
                    });
                }
            }

            // 只更新 viewState.progress，不更新 bookConfig（参考 readest 架构）
            return {
                ...state,
                viewStates: {
                    ...state.viewStates,
                    [key]: {
                        ...viewState,
                        progress,
                    },
                },
            };
        });
    }

    /**
     * 初始化视图状态
     * 加载书籍内容并创建视图状态
     * @param maxRetries 最大重试次数，默认 2
     */
    async initViewState(
        book: Book,
        key: string,
        isPrimary: boolean = true,
        globalReaderSettings?: ReaderSettings,
        bookConfig?: BookConfig,
        maxRetries: number = 2,
    ): Promise<void> {
        // 设置加载状态
        this.store.update((state) => ({
            ...state,
            viewStates: {
                ...state.viewStates,
                [key]: {
                    key: '',
                    view: null,
                    isPrimary: false,
                    loading: true,
                    inited: false,
                    error: null,
                    progress: null,
                    ribbonVisible: false,
                    ttsEnabled: false,
                    readerSettings: null,
                    bookDoc: null,
                    gridInsets: null,
                },
            },
        }));

        let lastError: Error | null = null;
        let retryCount = 0;

        while (retryCount <= maxRetries) {
            try {
                // 初始化 BookData（如果不存在）
                const bookIdStr = String(book.id);
                let bookData = bookDataStore.getBookData(bookIdStr);
                if (!bookData) {
                    bookDataStore.setBookData(bookIdStr, {
                        id: bookIdStr,
                        book,
                        file: null,
                        config: null,
                        bookDoc: null,
                    });
                    bookData = bookDataStore.getBookData(bookIdStr)!;
                }

                // 如果没有提供 bookConfig，尝试从 BookDataStore 或数据库加载
                let finalBookConfig = bookConfig || bookData.config;
                if (!finalBookConfig && book.id) {
                    try {
                        const bookResult = await BookService.getById(book.id);
                        if (bookResult.success && bookResult.data) {
                            const currentProgress = bookResult.data.currentProgress as ReadingProgress | undefined;
                            // 优先使用 location，如果没有则使用 progress
                            const location = currentProgress?.location as string | undefined;
                            const progress = currentProgress?.currentPage && currentProgress?.totalPages
                                ? [currentProgress.currentPage, currentProgress.totalPages] as [number, number]
                                : undefined;

                            const bookReaderSettings = (bookResult.data as any).readerSettings as Partial<ReaderSettings> | undefined;
                            if (bookReaderSettings || location || progress) {
                                finalBookConfig = {
                                    location: location,
                                    progress: progress,
                                    readerSettings: bookReaderSettings,
                                    updatedAt: bookResult.data.updatedAt * 1000, // 转换为毫秒
                                };
                            } else {
                                finalBookConfig = {
                                    updatedAt: bookResult.data.updatedAt * 1000,
                                };
                            }
                            // 保存到 BookDataStore
                            bookDataStore.setBookData(bookIdStr, { config: finalBookConfig });
                        }
                    } catch (configError) {
                        console.warn('Failed to load book config from database:', configError);
                        // 继续使用默认配置
                    }
                }

                // 加载书籍内容
                const documentService = new DocumentService();
                const bookDoc = await documentService.loadBookContent(book);

                // 更新 BookDataStore
                bookDataStore.setBookData(bookIdStr, {
                    bookDoc,
                    config: finalBookConfig || {
                        updatedAt: Date.now(),
                    },
                });

                // 合并阅读器设置：全局 ReaderSettings + 书籍特定设置（参考 readest）
                // 如果 globalReaderSettings 未提供，尝试从注入的 store 获取或使用默认设置
                let finalGlobalReaderSettings = globalReaderSettings;
                if (!finalGlobalReaderSettings) {
                    try {
                        const store = inject(READER_SETTINGS);
                        if (store) {
                            let currentValue: ReaderSettings | undefined;
                            const unsubscribe = store.subscribe((value) => {
                                currentValue = value;
                            });
                            unsubscribe();
                            if (currentValue) {
                                finalGlobalReaderSettings = currentValue;
                            }
                        }
                    } catch {
                        // 如果注入失败，使用默认设置
                    }
                }
                if (!finalGlobalReaderSettings) {
                    finalGlobalReaderSettings = getDefaultReaderSettings(false, false);
                }
                const bookSpecificReaderSettings = finalBookConfig?.readerSettings || {};
                // 参考 readest: { ...globalReaderSettings, ...bookSpecificReaderSettings }
                // finalGlobalReaderSettings 此时已经确保不是 undefined
                const mergedReaderSettings = this.mergeReaderSettings(finalGlobalReaderSettings!, bookSpecificReaderSettings);

                // 更新视图状态
                this.store.update((state) => {
                    const viewState = state.viewStates[key];
                    if (!viewState) return state;

                    return {
                        ...state,
                        viewStates: {
                            ...state.viewStates,
                            [key]: {
                                ...viewState,
                                key,
                                isPrimary,
                                loading: false,
                                inited: false,
                                error: null,
                                readerSettings: mergedReaderSettings,
                                bookDoc,
                                gridInsets: viewState.gridInsets ?? null,
                            },
                        },
                    };
                });

                // 成功加载，退出重试循环
                return;
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                retryCount++;

                // 如果是最后一次尝试，设置错误状态
                if (retryCount > maxRetries) {
                    console.error(`Failed to initialize view state after ${maxRetries + 1} attempts:`, lastError);
                    const errorMessage = this.getErrorMessage(lastError, book);
                    this.store.update((state) => {
                        const viewState = state.viewStates[key];
                        if (!viewState) return state;

                        return {
                            ...state,
                            viewStates: {
                                ...state.viewStates,
                                [key]: {
                                    ...viewState,
                                    loading: false,
                                    inited: false,
                                    error: errorMessage,
                                },
                            },
                        };
                    });
                    return;
                }

                // 等待后重试（指数退避）
                const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
                console.warn(
                    `Failed to load book (attempt ${retryCount}/${maxRetries + 1}), retrying in ${delay}ms...`,
                    lastError,
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    /**
     * 获取友好的错误消息
     */
    private getErrorMessage(error: Error, book: Book): string {
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes('not found') || errorMessage.includes('不存在')) {
            return `书籍文件不存在：${book.path || book.title}`;
        }

        if (errorMessage.includes('empty') || errorMessage.includes('空')) {
            return '书籍文件为空或已损坏';
        }

        if (errorMessage.includes('unsupported') || errorMessage.includes('不支持')) {
            return `不支持的书籍格式：${book.format || '未知格式'}`;
        }

        if (errorMessage.includes('network') || errorMessage.includes('网络')) {
            return '网络错误，请检查网络连接后重试';
        }

        if (errorMessage.includes('permission') || errorMessage.includes('权限')) {
            return '没有权限访问书籍文件';
        }

        // 默认错误消息
        return `加载失败：${error.message || '未知错误'}`;
    }

    /**
     * 清除视图状态
     */
    clearViewState(key: string): void {
        this.store.update((state) => {
            const viewStates = { ...state.viewStates };
            delete viewStates[key];
            return {
                ...state,
                viewStates,
            };
        });
    }

    /**
     * 获取网格边距
     */
    getGridInsets(key: string): Insets {
        const viewState = this.getViewState(key);
        return viewState?.gridInsets || { top: 0, right: 0, bottom: 0, left: 0 };
    }

    /**
     * 设置网格边距
     */
    setGridInsets(key: string, insets: Insets | null): void {
        this.store.update((state) => {
            const viewState = state.viewStates[key];
            if (!viewState) return state;

            return {
                ...state,
                viewStates: {
                    ...state.viewStates,
                    [key]: {
                        ...viewState,
                        gridInsets: insets,
                    },
                },
            };
        });
    }
}

// 创建单例实例
export const readerStore = new ReaderStore();
