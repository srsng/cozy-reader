
/**
 * NotebookStore - 笔记存储
 * 管理书籍笔记、笔记分组和笔记搜索
 */

import { writable, type Writable, get } from 'svelte/store';
import type { BookNote, BooknoteGroup } from '../types';
import type { TextSelection } from '../utils/sel';
import { bookDataStore } from './bookDataStore';
import { CommentService } from '@cozy-reader/database';
import { commentsToBookNotes } from '../utils/commentConverter';

/**
 * NotebookStore 状态接口
 */
interface NotebookStoreState {
    /** 笔记映射，key 为 bookKey */
    notes: Record<string, BookNote[]>;
    /** 笔记侧边栏是否可见 */
    isVisible: boolean;
    /** 当前选中的笔记 ID */
    selectedNoteId: string | null;
    /** 新建注释的文本选择 */
    newAnnotation: TextSelection | null;
    /** 正在编辑的注释 */
    editAnnotation: BookNote | null;
    /** 注释草稿 */
    annotationDrafts: Record<string, string>;
    /** 笔记本宽度 */
    notebookWidth: string;
    /** 是否固定笔记本 */
    isPinned: boolean;
}

/**
 * 创建初始状态
 */
const InitialState: NotebookStoreState = {
    notes: {},
    isVisible: false,
    selectedNoteId: null,
    newAnnotation: null,
    editAnnotation: null,
    annotationDrafts: {},
    notebookWidth: '30%',
    isPinned: false,
} as const;


/**
 * NotebookStore 类
 * 提供笔记管理和搜索功能
 */
class NotebookStore {
    private store: Writable<NotebookStoreState>;

    constructor() {
        const initialState = { ...InitialState };
        this.store = writable(initialState);
    }

    /**
     * 订阅状态变化
     */
    subscribe(callback: (state: NotebookStoreState) => void): () => void {
        return this.store.subscribe(callback);
    }

    /**
     * 设置笔记侧边栏可见性
     */
    setVisible(visible: boolean): void {
        this.store.update((state) => ({
            ...state,
            isVisible: visible,
        }));
    }

    /**
     * 获取笔记侧边栏可见性
     */
    getVisible(): boolean {
        return get(this.store).isVisible;
    }

    /**
     * 加载笔记（从 BookDataStore 运行时缓存）
     */
    loadNotes(bookKey: string): void {
        const config = bookDataStore.getConfig(bookKey);
        const booknotes = config?.booknotes || [];

        this.store.update((state) => ({
            ...state,
            notes: {
                ...state.notes,
                [bookKey]: booknotes.filter((note) => !note.deletedAt),
            },
        }));
    }

    /**
     * 从数据库加载笔记
     */
    async loadNotesFromDatabase(bookKey: string): Promise<void> {
        const bookData = bookDataStore.getBookData(bookKey);
        if (!bookData?.book?.id) {
            console.warn('No book data found for loading notes:', bookKey);
            return;
        }

        try {
            const bookId = bookData.book.id;
            const result = await CommentService.listByBookId(bookId);

            if (!result.success || !result.data) {
                console.warn('Failed to load notes from database:', result.error);
                return;
            }

            const comments = result.data;
            const booknotes = commentsToBookNotes(
                comments.filter((comment) => !comment.deletedAt),
                bookData.config?.bookHash
            );

            // 更新 BookDataStore 作为运行时缓存
            bookDataStore.updateBooknotes(bookKey, booknotes);

            // 更新 notebookStore
            this.store.update((state) => ({
                ...state,
                notes: {
                    ...state.notes,
                    [bookKey]: booknotes,
                },
            }));
        } catch (error) {
            console.error('Failed to load notes from database:', error);
        }
    }

    /**
     * 获取书籍的所有笔记
     */
    getNotesByBook(bookKey: string): BookNote[] {
        return get(this.store).notes[bookKey] || [];
    }

    /**
     * 添加笔记（通过 AnnotationService 保存到数据库）
     */
    async addNote(bookKey: string, note: BookNote): Promise<void> {
        // 先更新运行时缓存
        const notes = this.getNotesByBook(bookKey);
        const updatedNotes = [...notes, note];

        this.store.update((state) => ({
            ...state,
            notes: {
                ...state.notes,
                [bookKey]: updatedNotes,
            },
        }));

        // 更新 BookDataStore 运行时缓存
        bookDataStore.updateBooknotes(bookKey, updatedNotes);

        // 注意：实际保存到数据库应该通过 AnnotationService.saveAnnotation
        // 这里只更新运行时状态
    }

    /**
     * 更新笔记（通过 AnnotationService 保存到数据库）
     */
    async updateNote(bookKey: string, noteId: string, updates: Partial<BookNote>): Promise<void> {
        const notes = this.getNotesByBook(bookKey);
        const index = notes.findIndex((note) => note.id === noteId);
        if (index === -1) {
            console.warn('Note not found:', noteId);
            return;
        }

        const updatedNote: BookNote = {
            ...notes[index]!,
            ...updates,
            updatedAt: Date.now(),
        };

        const updatedNotes = [...notes];
        updatedNotes[index] = updatedNote;

        this.store.update((state) => ({
            ...state,
            notes: {
                ...state.notes,
                [bookKey]: updatedNotes,
            },
        }));

        // 更新 BookDataStore 运行时缓存
        bookDataStore.updateBooknotes(bookKey, updatedNotes);

        // 注意：实际保存到数据库应该通过 AnnotationService.updateAnnotation
        // 这里只更新运行时状态
    }

    /**
     * 删除笔记（软删除，通过 AnnotationService 保存到数据库）
     */
    async deleteNote(bookKey: string, noteId: string): Promise<void> {
        // 更新运行时状态
        const notes = this.getNotesByBook(bookKey);
        const updatedNotes = notes.map((note) =>
            note.id === noteId ? { ...note, deletedAt: Date.now() } : note
        );

        this.store.update((state) => ({
            ...state,
            notes: {
                ...state.notes,
                [bookKey]: updatedNotes,
            },
        }));

        // 更新 BookDataStore 运行时缓存
        bookDataStore.updateBooknotes(bookKey, updatedNotes);

        // 注意：实际保存到数据库应该通过 AnnotationService.deleteAnnotation
        // 这里只更新运行时状态
    }

    /**
     * 搜索笔记
     */
    searchNotes(bookKey: string, query: string): BookNote[] {
        const notes = this.getNotesByBook(bookKey);
        if (!query.trim()) {
            return notes;
        }

        const lowerQuery = query.toLowerCase();
        return notes.filter(
            (note) =>
                note.text?.toLowerCase().includes(lowerQuery) ||
                note.note.toLowerCase().includes(lowerQuery) ||
                note.cfi.includes(query)
        );
    }

    /**
     * 按章节分组笔记
     */
    getNotesGroupedBySection(bookKey: string, tocItems: Array<{ id: number; href: string; label: string }>): BooknoteGroup[] {
        const notes = this.getNotesByBook(bookKey);
        const groups: BooknoteGroup[] = [];

        // 为每个 TOC 项创建一个分组
        for (const tocItem of tocItems) {
            const sectionNotes = notes.filter((note) => {
                // 根据 CFI 或 href 判断笔记是否属于该章节
                return note.cfi.includes(tocItem.href) || note.cfi.startsWith(`epubcfi(${tocItem.id}`);
            });

            if (sectionNotes.length > 0) {
                groups.push({
                    id: tocItem.id,
                    href: tocItem.href,
                    label: tocItem.label,
                    booknotes: sectionNotes,
                });
            }
        }

        // 添加未分组的笔记
        const groupedNoteIds = new Set(groups.flatMap((g) => g.booknotes.map((n) => n.id)));
        const ungroupedNotes = notes.filter((note) => !groupedNoteIds.has(note.id));
        if (ungroupedNotes.length > 0) {
            groups.push({
                id: 0,
                href: '',
                label: '未分组',
                booknotes: ungroupedNotes,
            });
        }

        return groups;
    }

    /**
     * 设置选中的笔记
     */
    setSelectedNoteId(noteId: string | null): void {
        this.store.update((state) => ({
            ...state,
            selectedNoteId: noteId,
        }));
    }

    /**
     * 清除笔记数据
     */
    clearNotes(bookKey: string): void {
        this.store.update((state) => {
            const { [bookKey]: _, ...rest } = state.notes;
            return {
                ...state,
                notes: rest,
            };
        });
    }

    /**
     * 设置新建注释
     */
    setNewAnnotation(selection: TextSelection | null): void {
        this.store.update((state) => ({
            ...state,
            newAnnotation: selection,
        }));
    }

    /**
     * 获取新建注释
     */
    getNewAnnotation(): TextSelection | null {
        return get(this.store).newAnnotation;
    }

    /**
     * 设置编辑注释
     */
    setEditAnnotation(note: BookNote | null): void {
        this.store.update((state) => ({
            ...state,
            editAnnotation: note,
        }));
    }

    /**
     * 获取编辑注释
     */
    getEditAnnotation(): BookNote | null {
        return get(this.store).editAnnotation;
    }

    /**
     * 保存注释草稿
     */
    saveAnnotationDraft(key: string, note: string): void {
        this.store.update((state) => ({
            ...state,
            annotationDrafts: {
                ...state.annotationDrafts,
                [key]: note,
            },
        }));
    }

    /**
     * 获取注释草稿
     */
    getAnnotationDraft(key: string): string | undefined {
        return get(this.store).annotationDrafts[key];
    }

    /**
     * 设置笔记本宽度
     */
    setNotebookWidth(width: string): void {
        this.store.update((state) => ({
            ...state,
            notebookWidth: width,
        }));
    }

    /**
     * 获取笔记本宽度
     */
    getNotebookWidth(): string {
        return get(this.store).notebookWidth;
    }

    /**
     * 设置固定状态
     */
    setPinned(pinned: boolean): void {
        this.store.update((state) => ({
            ...state,
            isPinned: pinned,
        }));
    }

    /**
     * 获取固定状态
     */
    getPinned(): boolean {
        return get(this.store).isPinned;
    }

    /**
     * 切换固定状态
     */
    togglePinned(): void {
        this.setPinned(!get(this.store).isPinned);
    }
}

export const notebookStore = new NotebookStore();
