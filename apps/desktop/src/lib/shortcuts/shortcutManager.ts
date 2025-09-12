// 简化的快捷键管理服务

import type { StaticShortcut, KeyCombination, KeyboardEventContext } from './types';
import { KeyboardListener, ShortcutUtils } from './keyboardListener';

/**
 * 快捷键管理器
 */
export class SimpleShortcutManager {
	private keyboardListener: KeyboardListener;
	private shortcuts = new Map<string, StaticShortcut>();

	constructor() {
		this.keyboardListener = new KeyboardListener();
		this.setupKeyboardListener();
	}

	/**
	 * 初始化快捷键管理器
	 */
	init(): void {
		this.keyboardListener.start();
	}

	/**
	 * 注册单个快捷键
	 */
	register(shortcut: StaticShortcut): void {
		this.shortcuts.set(shortcut.id, shortcut);
	}

	/**
	 * 取消注册快捷键
	 */
	unregister(id: string): void {
		this.shortcuts.delete(id);
	}

	/**
	 * 批量注册快捷键
	 */
	registerShortcuts(shortcuts: StaticShortcut[]): void {
		shortcuts.forEach((shortcut) => this.register(shortcut));
	}

	/**
	 * 获取所有已注册的快捷键
	 */
	getShortcuts(): StaticShortcut[] {
		return Array.from(this.shortcuts.values());
	}

	/**
	 * 手动触发快捷键
	 */
	trigger(id: string): boolean {
		const shortcut = this.shortcuts.get(id);
		if (shortcut) {
			try {
				shortcut.handler();
				return true;
			} catch (error) {
				console.error(`执行快捷键 ${id} 时出错:`, error);
			}
		}
		return false;
	}

	/**
	 * 销毁管理器
	 */
	destroy(): void {
		this.keyboardListener.stop();
		this.shortcuts.clear();
	}

	/**
	 * 设置键盘监听器
	 */
	private setupKeyboardListener(): void {
		this.keyboardListener.addListener((combination, context) => {
			this.handleKeyboardEvent(combination, context);
		});
	}

	/**
	 * 处理键盘事件
	 */
	private handleKeyboardEvent(combination: KeyCombination, context: KeyboardEventContext): void {
		// 在输入框中禁用快捷键
		if (context.isInInput) {
			return;
		}

		// 查找匹配的快捷键
		const matchedShortcut = this.findMatch(combination);
		if (matchedShortcut) {
			// 阻止默认行为
			context.originalEvent.preventDefault();
			context.originalEvent.stopPropagation();

			// 执行快捷键
			this.executeShortcut(matchedShortcut);
		}
	}

	/**
	 * 查找匹配的快捷键
	 */
	private findMatch(combination: KeyCombination): StaticShortcut | null {
		for (const shortcut of this.shortcuts.values()) {
			if (ShortcutUtils.combinationsEqual(combination, shortcut.combination)) {
				return shortcut;
			}
		}
		return null;
	}

	/**
	 * 执行快捷键
	 */
	private executeShortcut(shortcut: StaticShortcut): void {
		try {
			shortcut.handler();
		} catch (error) {
			console.error(`执行快捷键 ${shortcut.id} 时出错:`, error);
		}
	}
}

// 导出单例实例
export const simpleShortcutManager = new SimpleShortcutManager();
