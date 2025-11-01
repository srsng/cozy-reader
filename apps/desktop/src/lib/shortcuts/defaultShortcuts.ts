// 默认快捷键绑定配置

import type { StaticShortcut } from './types';
import { ModifierKey } from './types';
import { simpleShortcutManager } from './shortcutManager';
import { emitMainWindowEvent } from '$lib/components/action/window-action.svelte';
import { goSettings } from '$lib/utils/route.svelte';
import { emit } from '@tauri-apps/api/event';
import { SHORTCUT_EVENT } from './shortcutService';
import { SHORTCUT_EVENTS_ENUM } from '$lib/events';

/**
 * 默认快捷键定义
 */
export const DEFAULT_SHORTCUTS: StaticShortcut[] = [
    // 窗口操作

    {
        id: 'window.toggle-always-on-top',
        name: '切换置顶状态',
        description: '切换窗口始终置顶状态',
        combination: { key: 't', modifiers: [ModifierKey.Ctrl, ModifierKey.Shift] },
        handler: () => emitMainWindowEvent('toggle-always-on-top')
    },
    // 缩放操作
    {
        id: 'zoom.in',
        name: '放大',
        description: '增加应用程序缩放比例',
        combination: { key: '=', modifiers: [ModifierKey.Ctrl] },
        handler: () => emit(SHORTCUT_EVENT, SHORTCUT_EVENTS_ENUM['zoom-in'])
    },
    {
        id: 'zoom.out',
        name: '缩小',
        description: '减少应用程序缩放比例',
        combination: { key: '-', modifiers: [ModifierKey.Ctrl] },
        handler: () => emit(SHORTCUT_EVENT, SHORTCUT_EVENTS_ENUM['zoom-out'])
    },
    {
        id: 'zoom.reset',
        name: '重置缩放',
        description: '重置应用程序缩放比例为100%',
        combination: { key: '0', modifiers: [ModifierKey.Ctrl] },
        handler: () => emit(SHORTCUT_EVENT, SHORTCUT_EVENTS_ENUM['zoom-reset'])
    },

    // // 导航操作
    // {
    // 	id: 'navigate.home',
    // 	name: '返回主页',
    // 	description: '导航到应用程序主页',
    // 	combination: { key: 'h', modifiers: [ModifierKey.Ctrl] },
    // 	handler: () => {
    // 		goHome();
    // 	}
    // },
    {
        id: 'navigate.settings',
        name: '打开设置',
        description: '导航到设置页面',
        combination: { key: ',', modifiers: [ModifierKey.Ctrl] },
        handler: () => {
            goSettings();
        }
    },
    // {
    // 	id: 'navigate.back',
    // 	name: '后退',
    // 	description: '返回上一页',
    // 	combination: { key: 'left', modifiers: [ModifierKey.Alt] },
    // 	handler: () => {
    // 		history.back();
    // 	}
    // },
    // {
    // 	id: 'navigate.forward',
    // 	name: '前进',
    // 	description: '前往下一页',
    // 	combination: { key: 'right', modifiers: [ModifierKey.Alt] },
    // 	handler: () => {
    // 		history.forward();
    // 	}
    // },

    // // 应用操作
    // {
    // 	id: 'app.refresh',
    // 	name: '刷新页面',
    // 	description: '刷新当前页面',
    // 	combination: { key: 'f5', modifiers: [] },
    // 	handler: () => {
    // 		emitMainWindowEvent('refresh-page');
    // 	}
    // },
    // {
    // 	id: 'app.toggle-dev-tools',
    // 	name: '切换开发者工具',
    // 	description: '打开/关闭开发者工具',
    // 	combination: { key: 'i', modifiers: [ModifierKey.Ctrl, ModifierKey.Shift] },
    // 	handler: () => emitMainWindowEvent('toggle-devtools')
    // },
    {
        id: 'app.toggle-fullscreen',
        name: '切换全屏',
        description: '切换全屏模式',
        combination: { key: 'f11', modifiers: [] },
        handler: () => emitMainWindowEvent('fullscreen')
    }
];

/**
 * 注册默认快捷键
 */
export function registerDefaultShortcuts(): void {
    DEFAULT_SHORTCUTS.forEach((shortcut) => {
        simpleShortcutManager.register(shortcut);
    });
}

/**
 * 取消注册默认快捷键
 */
export function unregisterDefaultShortcuts(): void {
    DEFAULT_SHORTCUTS.forEach((shortcut) => {
        simpleShortcutManager.unregister(shortcut.id);
    });
}

/**
 * 获取默认快捷键定义
 */
export function getDefaultShortcuts(): StaticShortcut[] {
    return [...DEFAULT_SHORTCUTS];
}

/**
 * 根据ID获取快捷键定义
 */
export function getShortcutById(id: string): StaticShortcut | undefined {
    return DEFAULT_SHORTCUTS.find((shortcut) => shortcut.id === id);
}
