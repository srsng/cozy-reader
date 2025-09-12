// 简化的快捷键系统类型定义

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
 * 快捷键组合
 */
export interface KeyCombination {
	/** 主键 */
	key: string;
	/** 修饰键 */
	modifiers: ModifierKey[];
}

/**
 * 快捷键分类
 */
export enum ShortcutCategory {
	Window = 'window',
	Navigation = 'navigation',
	Zoom = 'zoom',
	Reader = 'reader',
	Application = 'application',
	Settings = 'settings'
}

/**
 * 简化的快捷键定义
 */
export interface ShortcutDefinition {
	/** 快捷键名称 */
	name: string;
	/** 快捷键描述 */
	description: string;
	/** 快捷键分类 */
	category: ShortcutCategory;
	/** 键盘组合 */
	combination: KeyCombination;
}

/**
 * 静态快捷键
 */
export interface StaticShortcut {
	/** 快捷键ID */
	id: string;
	/** 快捷键名称 */
	name: string;
	/** 快捷键描述 */
	description: string;
	/** 键盘组合 */
	combination: KeyCombination;
	global?: boolean;
	/** 是否在输入框中禁用 */
	disableInInput?: boolean;
	/** 处理函数 */
	handler: () => void;
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
