// 默认按键绑定配置

import type { StaticKeybinding } from './types';
import { ModifierKey } from './types';
import { keybindingManager } from './keybindingManager';

/**
 * 默认按键绑定定义
 */
export const DEFAULT_KEYBINDINGS: StaticKeybinding[] = [
    {
        id: 'window.toggle-always-on-top',
        name: '切换置顶状态',
        description: '切换窗口始终置顶状态',
        combination: { key: 't', modifiers: [ModifierKey.Ctrl, ModifierKey.Shift] },
        commandId: 'window.toggleAlwaysOnTop'
    },
    // 缩放操作
    {
        id: 'zoom.in',
        name: '放大',
        description: '增加应用程序缩放比例',
        combination: { key: '=', modifiers: [ModifierKey.Ctrl] },
        commandId: 'zoom.in'
    },
    {
        id: 'zoom.out',
        name: '缩小',
        description: '减少应用程序缩放比例',
        combination: { key: '-', modifiers: [ModifierKey.Ctrl] },
        commandId: 'zoom.out'
    },
    {
        id: 'zoom.reset',
        name: '重置缩放',
        description: '重置应用程序缩放比例为100%',
        combination: { key: '0', modifiers: [ModifierKey.Ctrl] },
        commandId: 'zoom.reset'
    },
    {
        id: 'navigate.settings',
        name: '打开设置',
        description: '导航到设置页面',
        combination: { key: ',', modifiers: [ModifierKey.Ctrl] },
        commandId: 'navigate.settings'
    },
    {
        id: 'app.toggle-fullscreen',
        name: '切换全屏',
        description: '切换全屏模式',
        combination: { key: 'f11', modifiers: [] },
        commandId: 'window.toggleFullscreen'
    }
];

/**
 * 注册默认按键绑定
 */
export function registerDefaultKeybindings(): void {
    DEFAULT_KEYBINDINGS.forEach((keybinding) => {
        keybindingManager.register(keybinding);
    });
}

/**
 * 取消注册默认按键绑定
 */
export function unregisterDefaultKeybindings(): void {
    DEFAULT_KEYBINDINGS.forEach((keybinding) => {
        keybindingManager.unregister(keybinding.id);
    });
}

/**
 * 获取默认按键绑定定义
 */
export function getDefaultKeybindings(): StaticKeybinding[] {
    return [...DEFAULT_KEYBINDINGS];
}

/**
 * 根据ID获取按键绑定定义
 */
export function getKeybindingById(id: string): StaticKeybinding | undefined {
    return DEFAULT_KEYBINDINGS.find((keybinding) => keybinding.id === id);
}
