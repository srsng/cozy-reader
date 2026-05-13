import type { CommandId } from '$lib/commands';

// 前端按键绑定系统类型定义

/**
 * 修饰键枚举
 */
export enum ModifierKey {
    Ctrl = 'ctrl',
    Shift = 'shift',
    Alt = 'alt',
    Meta = 'meta' // Windows键/Cmd键
}

/**
 * 按键组合
 */
export interface KeyCombination {
    /** 主键 */
    key: string;
    /** 修饰键 */
    modifiers: ModifierKey[];
}

/**
 * 按键绑定分类
 */
export enum KeybindingCategory {
    Window = 'window',
    Navigation = 'navigation',
    Zoom = 'zoom',
    Reader = 'reader',
    Application = 'application',
    Settings = 'settings'
}

/**
 * 按键绑定定义
 */
export interface KeybindingDefinition {
    /** 按键绑定名称 */
    name: string;
    /** 按键绑定描述 */
    description: string;
    /** 按键绑定分类 */
    category: KeybindingCategory;
    /** 键盘组合 */
    combination: KeyCombination;
}

/**
 * 静态按键绑定
 */
export interface StaticKeybinding {
    /** 按键绑定ID */
    id: string;
    /** 按键绑定名称 */
    name: string;
    /** 按键绑定描述 */
    description: string;
    /** 键盘组合 */
    combination: KeyCombination;
    global?: boolean;
    /** 是否在输入框中禁用 */
    disableInInput?: boolean;
    /** 关联命令 */
    commandId?: CommandId;
    /** 命令参数 */
    payload?: unknown;
    /** 兼容直接处理函数 */
    handler?: () => void | Promise<void>;
}

/**
 * 键盘事件上下文
 */
export interface KeyboardEventContext {
    /** 原始键盘事件 */
    originalEvent: KeyboardEvent;
    /** 事件目标 */
    target: EventTarget | null;
    /** 是否在输入框中 */
    isInInput: boolean;
}
