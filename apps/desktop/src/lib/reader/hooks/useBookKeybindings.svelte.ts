/**
 * useBookKeybindings - 书籍阅读器按键绑定处理 Hook
 * 提供统一的按键绑定处理功能
 *
 * 这是一个 Svelte 5 的 rune-based hook，使用 .svelte.ts 扩展名以支持 runes
 */

import { readerStore } from '../stores/readerStore';
import { sidebarStore } from '../stores/sidebarStore';
import { notebookStore } from '../stores/notebookStore';
import type { FoliateViewElement } from '../types';

/**
 * 按键绑定配置
 */
export interface BookKeybindingConfig {
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
 * 默认按键绑定配置
 */
const DEFAULT_BOOK_KEYBINDINGS: BookKeybindingConfig = {
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
 * 按键绑定动作处理器
 */
export interface BookKeybindingHandlers {
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
 * 解析按键绑定字符串
 */
function parseKeybinding(keybinding: string): {
    key: string;
    ctrlKey: boolean;
    altKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
} {
    const parts = keybinding
        .toLowerCase()
        .split('+')
        .map((p) => p.trim());
    return {
        key: parts.find((p) => !['ctrl', 'alt', 'meta', 'cmd', 'shift'].includes(p)) || '',
        ctrlKey: parts.includes('ctrl'),
        altKey: parts.includes('alt'),
        metaKey: parts.includes('meta') || parts.includes('cmd'),
        shiftKey: parts.includes('shift')
    };
}

/**
 * 检查按键绑定是否匹配
 */
function isKeybindingMatch(keybinding: string, event: KeyboardEvent): boolean {
    const parsed = parseKeybinding(keybinding);
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
 * 书籍按键绑定 Hook
 * 使用 $effect 自动管理键盘事件监听器的生命周期
 * @param bookKey 书籍键
 * @param handlers 按键绑定处理器
 * @param keybindings 自定义按键绑定配置（可选）
 */
export function useBookKeybindings(
    bookKey: string,
    handlers: BookKeybindingHandlers,
    keybindings: BookKeybindingConfig = DEFAULT_BOOK_KEYBINDINGS
): () => void {
    // 使用 $effect 管理键盘事件监听
    $effect(() => {
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

            // 检查按键绑定匹配
            const key = event.key;

            // 上一页
            if (keybindings.prevPage?.some((s) => isKeybindingMatch(s, event))) {
                event.preventDefault();
                handlers.onPrevPage?.();
                return;
            }

            // 下一页
            if (keybindings.nextPage?.some((s) => isKeybindingMatch(s, event))) {
                event.preventDefault();
                handlers.onNextPage?.();
                return;
            }

            // 上一章节
            if (keybindings.prevSection?.some((s) => isKeybindingMatch(s, event))) {
                event.preventDefault();
                handlers.onPrevSection?.();
                return;
            }

            // 下一章节
            if (keybindings.nextSection?.some((s) => isKeybindingMatch(s, event))) {
                event.preventDefault();
                handlers.onNextSection?.();
                return;
            }

            // 切换侧边栏
            if (keybindings.toggleSidebar?.some((s) => isKeybindingMatch(s, event))) {
                event.preventDefault();
                handlers.onToggleSidebar?.();
                return;
            }

            // 切换笔记本
            if (keybindings.toggleNotebook?.some((s) => isKeybindingMatch(s, event))) {
                event.preventDefault();
                handlers.onToggleNotebook?.();
                return;
            }

            // 打开设置
            if (keybindings.openSettings?.some((s) => isKeybindingMatch(s, event))) {
                event.preventDefault();
                handlers.onOpenSettings?.();
                return;
            }

            // 搜索
            if (keybindings.search?.some((s) => isKeybindingMatch(s, event))) {
                event.preventDefault();
                handlers.onSearch?.();
                return;
            }

            // 退出全屏
            if (keybindings.exitFullscreen?.some((s) => isKeybindingMatch(s, event))) {
                event.preventDefault();
                handlers.onExitFullscreen?.();
                return;
            }
        };

        // 注册事件监听器
        window.addEventListener('keydown', handleKeyDown);

        // 自动清理事件监听器
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    });

    // 为了保持 API 兼容性，仍然返回一个清理函数（虽然 $effect 会自动清理）
    return () => {};
}

/**
 * 创建默认的按键绑定处理器（基于当前书籍状态）
 * @param bookKey 书籍键
 * @returns 按键绑定处理器
 */
export function createDefaultKeybindingHandlers(bookKey: string): BookKeybindingHandlers {
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
