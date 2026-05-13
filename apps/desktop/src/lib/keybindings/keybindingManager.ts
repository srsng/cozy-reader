// 前端按键绑定管理服务

import type { CommandId } from '$lib/commands';
import type { StaticKeybinding, KeyCombination, KeyboardEventContext } from './types';
import { KeybindingListener, KeybindingUtils } from './keybindingListener';

type CommandExecutor = (commandId: CommandId, payload?: unknown) => void | Promise<void>;

/**
 * 按键绑定管理器
 */
export class KeybindingManager {
    private keybindingListener: KeybindingListener;
    private keybindings = new Map<string, StaticKeybinding>();
    private commandExecutor: CommandExecutor | undefined;

    constructor() {
        this.keybindingListener = new KeybindingListener();
        this.setupKeybindingListener();
    }

    /**
     * 初始化按键绑定管理器
     */
    init(): void {
        this.keybindingListener.start();
    }

    /**
     * 注册单个按键绑定
     */
    register(keybinding: StaticKeybinding): void {
        this.keybindings.set(keybinding.id, keybinding);
    }

    setCommandExecutor(commandExecutor: CommandExecutor): void {
        this.commandExecutor = commandExecutor;
    }

    /**
     * 取消注册按键绑定
     */
    unregister(id: string): void {
        this.keybindings.delete(id);
    }

    /**
     * 批量注册按键绑定
     */
    registerKeybindings(keybindings: StaticKeybinding[]): void {
        keybindings.forEach((keybinding) => this.register(keybinding));
    }

    /**
     * 获取所有已注册的按键绑定
     */
    getKeybindings(): StaticKeybinding[] {
        return Array.from(this.keybindings.values());
    }

    /**
     * 手动触发按键绑定
     */
    trigger(id: string): boolean {
        const keybinding = this.keybindings.get(id);
        if (keybinding) {
            this.executeKeybinding(keybinding);
            return true;
        }
        return false;
    }

    /**
     * 销毁管理器
     */
    destroy(): void {
        this.keybindingListener.stop();
        this.keybindings.clear();
    }

    /**
     * 设置键盘监听器
     */
    private setupKeybindingListener(): void {
        this.keybindingListener.addListener((combination, context) => {
            this.handleKeyboardEvent(combination, context);
        });
    }

    /**
     * 处理键盘事件
     */
    private handleKeyboardEvent(combination: KeyCombination, context: KeyboardEventContext): void {
        // 在输入框中禁用按键绑定
        if (context.isInInput) {
            return;
        }

        // 查找匹配的按键绑定
        const matchedKeybinding = this.findMatch(combination);
        if (matchedKeybinding) {
            // 阻止默认行为
            context.originalEvent.preventDefault();
            context.originalEvent.stopPropagation();

            // 执行按键绑定
            this.executeKeybinding(matchedKeybinding);
        }
    }

    /**
     * 查找匹配的按键绑定
     */
    private findMatch(combination: KeyCombination): StaticKeybinding | null {
        for (const keybinding of this.keybindings.values()) {
            if (KeybindingUtils.combinationsEqual(combination, keybinding.combination)) {
                return keybinding;
            }
        }
        return null;
    }

    /**
     * 执行按键绑定
     */
    private executeKeybinding(keybinding: StaticKeybinding): void {
        try {
            const result = keybinding.commandId
                ? this.commandExecutor?.(keybinding.commandId, keybinding.payload)
                : keybinding.handler?.();

            if (!keybinding.commandId && !keybinding.handler) {
                console.warn(`按键绑定 ${keybinding.id} 没有关联命令或处理函数`);
            }

            if (keybinding.commandId && !this.commandExecutor) {
                console.warn(`按键绑定 ${keybinding.id} 缺少命令执行器`);
            }

            Promise.resolve(result).catch((error) => {
                console.error(`执行按键绑定 ${keybinding.id} 时出错:`, error);
            });
        } catch (error) {
            console.error(`执行按键绑定 ${keybinding.id} 时出错:`, error);
        }
    }
}

// 导出单例实例
export const keybindingManager = new KeybindingManager();
