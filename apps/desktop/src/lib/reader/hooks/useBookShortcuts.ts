/**
 * useBookShortcuts - 书籍阅读器快捷键处理 Hook
 * 提供统一的快捷键处理功能
 */

import { readerStore } from '../stores/readerStore';
import { sidebarStore } from '../stores/sidebarStore';
import { notebookStore } from '../stores/notebookStore';
import type { FoliateViewElement } from '../types';

/**
 * 快捷键配置
 */
export interface ShortcutConfig {
    /** 上一页 */
    prevPage?: string[];
    /** 下一页 */
    nextPage?: string[];
    /** 上一章节 */
    prevSection?: string[];
    /** 下一章节 */
    nextSection?: string[];
    /** 切换侧边栏 */
    toggleSidebar?: string[];
    /** 切换笔记本 */
    toggleNotebook?: string[];
    /** 打开设置 */
    openSettings?: string[];
    /** 搜索 */
    search?: string[];
    /** 退出全屏 */
    exitFullscreen?: string[];
}

/**
 * 默认快捷键配置
 */
const DEFAULT_SHORTCUTS: ShortcutConfig = {
    prevPage: ['ArrowLeft', 'h'],
    nextPage: ['ArrowRight', 'l'],
    prevSection: ['ArrowUp', 'k'],
    nextSection: ['ArrowDown', 'j'],
    toggleSidebar: ['b'],
    toggleNotebook: ['n'],
    openSettings: ['s'],
    search: ['f', 'ctrl+f', 'cmd+f'],
    exitFullscreen: ['Escape']
};

/**
 * 快捷键动作处理器
 */
export interface ShortcutHandlers {
    onPrevPage?: () => void;
    onNextPage?: () => void;
    onPrevSection?: () => void;
    onNextSection?: () => void;
    onToggleSidebar?: () => void;
    onToggleNotebook?: () => void;
    onOpenSettings?: () => void;
    onSearch?: () => void;
    onExitFullscreen?: () => void;
}

/**
 * 解析快捷键字符串
 */
function parseShortcut(shortcut: string): {
    key: string;
    ctrlKey: boolean;
    altKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
} {
    const parts = shortcut.toLowerCase().split('+').map(p => p.trim());
    return {
        key: parts.find(p => !['ctrl', 'alt', 'meta', 'cmd', 'shift'].includes(p)) || '',
        ctrlKey: parts.includes('ctrl'),
        altKey: parts.includes('alt'),
        metaKey: parts.includes('meta') || parts.includes('cmd'),
        shiftKey: parts.includes('shift')
    };
}

/**
 * 检查快捷键是否匹配
 */
function isShortcutMatch(
    shortcut: string,
    event: KeyboardEvent
): boolean {
    const parsed = parseShortcut(shortcut);
    const eventKey = event.key.toLowerCase();

    return (
        parsed.key === eventKey &&
        parsed.ctrlKey === event.ctrlKey &&
        parsed.altKey === event.altKey &&
        parsed.metaKey === event.metaKey &&
        parsed.shiftKey === event.shiftKey
    );
}

/**
 * 书籍快捷键 Hook
 * @param bookKey 书籍键
 * @param handlers 快捷键处理器
 * @param shortcuts 自定义快捷键配置（可选）
 * @returns 清理函数
 */
export function useBookShortcuts(
    bookKey: string,
    handlers: ShortcutHandlers,
    shortcuts: ShortcutConfig = DEFAULT_SHORTCUTS
): () => void {
    const handleKeyDown = (event: KeyboardEvent) => {
        // 检查焦点是否在输入元素上
        const activeElement = document.activeElement as HTMLElement;
        const isInputElement =
            activeElement?.tagName === 'INPUT' ||
            activeElement?.tagName === 'TEXTAREA' ||
            activeElement?.isContentEditable;

        // 如果是输入元素且不是笔记编辑器，跳过处理
        const isNoteEditor = activeElement?.classList.contains('note-editor-container');
        if (isInputElement && !isNoteEditor) {
            return;
        }

        // 检查快捷键匹配
        const key = event.key;

        // 上一页
        if (shortcuts.prevPage?.some(s => isShortcutMatch(s, event))) {
            event.preventDefault();
            handlers.onPrevPage?.();
            return;
        }

        // 下一页
        if (shortcuts.nextPage?.some(s => isShortcutMatch(s, event))) {
            event.preventDefault();
            handlers.onNextPage?.();
            return;
        }

        // 上一章节
        if (shortcuts.prevSection?.some(s => isShortcutMatch(s, event))) {
            event.preventDefault();
            handlers.onPrevSection?.();
            return;
        }

        // 下一章节
        if (shortcuts.nextSection?.some(s => isShortcutMatch(s, event))) {
            event.preventDefault();
            handlers.onNextSection?.();
            return;
        }

        // 切换侧边栏
        if (shortcuts.toggleSidebar?.some(s => isShortcutMatch(s, event))) {
            event.preventDefault();
            handlers.onToggleSidebar?.();
            return;
        }

        // 切换笔记本
        if (shortcuts.toggleNotebook?.some(s => isShortcutMatch(s, event))) {
            event.preventDefault();
            handlers.onToggleNotebook?.();
            return;
        }

        // 打开设置
        if (shortcuts.openSettings?.some(s => isShortcutMatch(s, event))) {
            event.preventDefault();
            handlers.onOpenSettings?.();
            return;
        }

        // 搜索
        if (shortcuts.search?.some(s => isShortcutMatch(s, event))) {
            event.preventDefault();
            handlers.onSearch?.();
            return;
        }

        // 退出全屏
        if (shortcuts.exitFullscreen?.some(s => isShortcutMatch(s, event))) {
            event.preventDefault();
            handlers.onExitFullscreen?.();
            return;
        }
    };

    // 注册事件监听器
    window.addEventListener('keydown', handleKeyDown);

    // 返回清理函数
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
}

/**
 * 创建默认的快捷键处理器（基于当前书籍状态）
 * @param bookKey 书籍键
 * @returns 快捷键处理器
 */
export function createDefaultShortcutHandlers(bookKey: string): ShortcutHandlers {
    const view = readerStore.getView(bookKey);

    return {
        onPrevPage: () => {
            view?.goLeft?.();
        },
        onNextPage: () => {
            view?.goRight?.();
        },
        onPrevSection: () => {
            view?.renderer?.prevSection?.();
        },
        onNextSection: () => {
            view?.renderer?.nextSection?.();
        },
        onToggleSidebar: () => {
            sidebarStore.toggle();
        },
        onToggleNotebook: () => {
            notebookStore.setVisible(!notebookStore.getVisible());
        },
        onOpenSettings: () => {
            window.dispatchEvent(
                new CustomEvent('settings-open', {
                    detail: { bookKey }
                })
            );
        },
        onSearch: () => {
            sidebarStore.setCurrentTab('search');
            sidebarStore.setVisible(true);
        },
        onExitFullscreen: () => {
            // TODO: 实现退出全屏逻辑
        }
    };
}
