// 全局键盘事件监听器

import type {
	KeyboardEventContext,
	KeyCombination
} from './types';
import { ModifierKey } from './types';

/**
 * 键盘监听器类
 */
export class KeyboardListener {
	private listeners: Set<(combination: KeyCombination, context: KeyboardEventContext) => void> = new Set();
	private isListening = false;

	/**
	 * 开始监听键盘事件
	 */
	start(): void {
		if (this.isListening) return;

		document.addEventListener('keydown', this.handleKeyDown, true);
		this.isListening = true;
	}

	/**
	 * 停止监听键盘事件
	 */
	stop(): void {
		if (!this.isListening) return;

		document.removeEventListener('keydown', this.handleKeyDown, true);
		this.isListening = false;
	}

	/**
	 * 添加键盘事件监听器
	 */
	addListener(listener: (combination: KeyCombination, context: KeyboardEventContext) => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	/**
	 * 处理键盘按下事件
	 */
	private handleKeyDown = (event: KeyboardEvent): void => {
		// 忽略单独的修饰键
		if (this.isModifierKey(event.key)) return;

		// 解析键盘组合
		const combination = this.parseKeyCombination(event);
		if (!combination) return;

		// 创建事件上下文
		const context = this.createEventContext(event);

		// 通知所有监听器
		this.listeners.forEach(listener => {
			try {
				listener(combination, context);
			} catch (error) {
				console.error('快捷键监听器执行错误:', error);
			}
		});
	};

	/**
	 * 解析键盘组合
	 */
	private parseKeyCombination(event: KeyboardEvent): KeyCombination | null {
		const modifiers: ModifierKey[] = [];
		const key = this.normalizeKey(event.key);

		// 收集修饰键
		if (event.ctrlKey) modifiers.push(ModifierKey.Ctrl);
		if (event.shiftKey) modifiers.push(ModifierKey.Shift);
		if (event.altKey) modifiers.push(ModifierKey.Alt);
		if (event.metaKey) modifiers.push(ModifierKey.Meta);

		// 如果只有修饰键，不创建组合
		if (!key || this.isModifierKey(key)) return null;

		return { key, modifiers };
	}

	/**
	 * 标准化按键名称
	 */
	private normalizeKey(key: string): string {
		// 标准化特殊键名
		const keyMap: Record<string, string> = {
			' ': 'Space',
			'ArrowUp': 'Up',
			'ArrowDown': 'Down',
			'ArrowLeft': 'Left',
			'ArrowRight': 'Right',
			'Escape': 'Esc',
			'Delete': 'Del',
			'Insert': 'Ins'
		};

		return keyMap[key] || key.toLowerCase();
	}

	/**
	 * 检查是否为修饰键
	 */
	private isModifierKey(key: string): boolean {
		const modifierKeys = ['Control', 'Shift', 'Alt', 'Meta', 'ctrl', 'shift', 'alt', 'meta'];
		return modifierKeys.includes(key);
	}

	/**
	 * 创建事件上下文
	 */
	private createEventContext(event: KeyboardEvent): KeyboardEventContext {
		const target = event.target as HTMLElement;
		const isInInput = this.isInputElement(target);

		return {
		originalEvent: event,
		target: event.target,
		isInInput
	};
	}

	/**
	 * 检查是否为输入元素
	 */
	private isInputElement(element: HTMLElement): boolean {
		if (!element) return false;

		const inputTags = ['input', 'textarea', 'select'];
		const tagName = element.tagName.toLowerCase();

		// 检查标签名
		if (inputTags.includes(tagName)) return true;

		// 检查contenteditable
		if (element.contentEditable === 'true') return true;

		// 检查父元素是否为输入元素
		const parent = element.parentElement;
		if (parent && this.isInputElement(parent)) return true;

		return false;
	}

	/**
	 * 销毁监听器
	 */
	destroy(): void {
		this.stop();
		this.listeners.clear();
	}
}

/**
 * 快捷键组合工具函数
 */
export class ShortcutUtils {
	/**
	 * 将快捷键组合转换为字符串
	 */
	static combinationToString(combination: KeyCombination): string {
		const parts: string[] = [];

		// 按固定顺序添加修饰键
		if (combination.modifiers.includes(ModifierKey.Ctrl)) parts.push('Ctrl');
		if (combination.modifiers.includes(ModifierKey.Shift)) parts.push('Shift');
		if (combination.modifiers.includes(ModifierKey.Alt)) parts.push('Alt');
		if (combination.modifiers.includes(ModifierKey.Meta)) parts.push('Meta');

		// 添加主键
		parts.push(combination.key);

		return parts.join('+');
	}

	/**
	 * 从字符串解析快捷键组合
	 */
	static stringToCombination(str: string): KeyCombination | null {
		const parts = str.split('+').map(p => p.trim());
		if (parts.length === 0) return null;

		const key = parts.pop()!;
		const modifiers: ModifierKey[] = [];

		for (const part of parts) {
			switch (part.toLowerCase()) {
				case 'ctrl':
					modifiers.push(ModifierKey.Ctrl);
					break;
				case 'shift':
					modifiers.push(ModifierKey.Shift);
					break;
				case 'alt':
					modifiers.push(ModifierKey.Alt);
					break;
				case 'meta':
					modifiers.push(ModifierKey.Meta);
					break;
			}
		}

		return { key, modifiers };
	}

	/**
	 * 比较两个快捷键组合是否相等
	 */
	static combinationsEqual(a: KeyCombination, b: KeyCombination): boolean {
		if (a.key !== b.key) return false;
		if (a.modifiers.length !== b.modifiers.length) return false;

		// 检查所有修饰键是否匹配
		for (const modifier of a.modifiers) {
			if (!b.modifiers.includes(modifier)) return false;
		}

		return true;
	}

	/**
	 * 验证快捷键组合是否有效
	 */
	static isValidCombination(combination: KeyCombination): boolean {
		// 必须有主键
		if (!combination.key || combination.key.trim() === '') return false;

		// 单个字符键通常需要修饰键
		if (combination.key.length === 1 && combination.modifiers.length === 0) {
			return false;
		}

		// 功能键可以不需要修饰键
		const functionKeys = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'];
		if (functionKeys.includes(combination.key.toLowerCase())) return true;

		// 特殊键可以不需要修饰键
		const specialKeys = ['esc', 'enter', 'space', 'tab', 'up', 'down', 'left', 'right', 'home', 'end', 'pageup', 'pagedown'];
		if (specialKeys.includes(combination.key.toLowerCase())) return true;

		return combination.modifiers.length > 0;
	}
}