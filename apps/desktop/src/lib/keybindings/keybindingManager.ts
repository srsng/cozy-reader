// 前端按键绑定管理服务

import type { CommandInvocation, CommandReference } from '$lib/commands/types';
import { ContextKey, type ContextKeyService } from '$lib/context-keys';
import { DisposableStore, toDisposable, type Disposable } from '$lib/utils/disposable';
import type {
    KeybindingResolution,
    StaticKeybinding,
    KeyCombination,
    KeyboardEventContext,
    UserKeybindingRule
} from './types';
import { KeybindingListener } from './keybindingListener';
import { KeybindingResolver } from './keybindingResolver';
import { userKeybindingRuleToStaticKeybinding } from './userKeybindings';
import { isBlockedBrowserShortcut } from './defaultBrowserShortcuts';

type CommandExecutor = {
    canExecute: (invocation: CommandInvocation) => boolean;
    execute: (invocation: CommandInvocation) => boolean | Promise<boolean>;
};

/**
 * 按键绑定管理器
 */
export class KeybindingManager {
    private keybindingListener: KeybindingListener;
    private keybindings = new Map<string, StaticKeybinding>();
    private commandExecutor: CommandExecutor | undefined;
    private contextKeyService: ContextKeyService | undefined;
    private nextRegistrationOrder = 0;
    private resolver = new KeybindingResolver();

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

    stopListening(): void {
        this.keybindingListener.stop();
    }

    /**
     * 注册单个按键绑定
     */
    register(keybinding: StaticKeybinding): Disposable {
        const registeredKeybinding = this.withRegistrationOrder(keybinding);
        this.keybindings.set(registeredKeybinding.id, registeredKeybinding);

        return toDisposable(() => {
            if (this.keybindings.get(registeredKeybinding.id) === registeredKeybinding) {
                this.keybindings.delete(registeredKeybinding.id);
            }
        });
    }

    setCommandExecutor(commandExecutor: CommandExecutor): void {
        this.commandExecutor = commandExecutor;
    }

    setContextKeyService(contextKeyService: ContextKeyService): void {
        this.contextKeyService = contextKeyService;
        this.resolver = new KeybindingResolver(contextKeyService);
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
    registerKeybindings(keybindings: StaticKeybinding[]): Disposable {
        const disposables = new DisposableStore();

        try {
            keybindings.forEach((keybinding) => disposables.add(this.register(keybinding)));
            return disposables;
        } catch (error) {
            disposables.dispose();
            throw error;
        }
    }

    applyUserKeybindingRules(rules: readonly UserKeybindingRule[]): Disposable {
        const originalKeybindings = new Map<string, StaticKeybinding | undefined>();
        const appliedKeybindings = new Map<string, StaticKeybinding | null>();

        for (const rule of rules) {
            if (!originalKeybindings.has(rule.id)) {
                originalKeybindings.set(rule.id, this.keybindings.get(rule.id));
            }

            if ('disabled' in rule && rule.disabled) {
                this.keybindings.delete(rule.id);
                appliedKeybindings.set(rule.id, null);
                continue;
            }

            const fallback = this.keybindings.get(rule.id) ?? originalKeybindings.get(rule.id);
            const keybinding = userKeybindingRuleToStaticKeybinding(rule, fallback);
            if (!keybinding) continue;

            const registeredKeybinding = this.withRegistrationOrder(keybinding);
            this.keybindings.set(rule.id, registeredKeybinding);
            appliedKeybindings.set(rule.id, registeredKeybinding);
        }

        return toDisposable(() => {
            for (const [id, originalKeybinding] of originalKeybindings) {
                const appliedKeybinding = appliedKeybindings.get(id);
                const currentKeybinding = this.keybindings.get(id);

                if (appliedKeybinding === null) {
                    if (currentKeybinding !== undefined) continue;
                } else if (currentKeybinding !== appliedKeybinding) {
                    continue;
                }

                if (originalKeybinding) {
                    this.keybindings.set(id, originalKeybinding);
                } else {
                    this.keybindings.delete(id);
                }
            }
        });
    }

    /**
     * 获取所有已注册的按键绑定
     */
    getKeybindings(): StaticKeybinding[] {
        return Array.from(this.keybindings.values());
    }

    getKeybindingsForCommand(commandId: CommandReference): StaticKeybinding[] {
        return this.resolver.getKeybindingsForCommand(this.keybindings.values(), commandId);
    }

    getKeybindingsForInvocation(invocation: CommandInvocation): StaticKeybinding[] {
        return this.resolver.getKeybindingsForInvocation(this.keybindings.values(), invocation);
    }

    inspect(combination: KeyCombination): KeybindingResolution {
        return this.resolver.inspect(this.keybindings.values(), combination);
    }

    /**
     * 手动触发按键绑定
     */
    trigger(id: string): boolean {
        const keybinding = this.keybindings.get(id);
        if (!keybinding || !this.canExecuteKeybinding(keybinding)) return false;

        this.executeKeybinding(keybinding);
        return true;
    }

    /**
     * 销毁管理器
     */
    destroy(): void {
        this.stopListening();
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
        this.contextKeyService?.set(ContextKey.TextInputFocus, context.isInInput);

        const matchedKeybinding = this.findMatch(combination);
        if (!matchedKeybinding || !this.canExecuteKeybinding(matchedKeybinding)) {
            if (isBlockedBrowserShortcut(combination)) {
                this.preventBrowserDefault(context);
            }
            return;
        }

        this.preventBrowserDefault(context);

        this.executeKeybinding(matchedKeybinding);
    }

    /**
     * 查找匹配的按键绑定
     */
    private findMatch(combination: KeyCombination): StaticKeybinding | null {
        return this.resolver.resolve(this.keybindings.values(), combination);
    }

    private preventBrowserDefault(context: KeyboardEventContext): void {
        context.originalEvent.preventDefault();
        context.originalEvent.stopPropagation();
    }

    private canExecuteKeybinding(keybinding: StaticKeybinding): boolean {
        if (keybinding.commandId) {
            if (!this.commandExecutor) return false;
            return this.commandExecutor.canExecute(this.toCommandInvocation(keybinding));
        }

        return Boolean(keybinding.handler);
    }

    /**
     * 执行按键绑定
     */
    private executeKeybinding(keybinding: StaticKeybinding): void {
        try {
            const result = keybinding.commandId
                ? this.commandExecutor?.execute(this.toCommandInvocation(keybinding))
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

    private toCommandInvocation(keybinding: StaticKeybinding): CommandInvocation {
        return {
            scope: keybinding.commandScope,
            commandId: keybinding.commandId!,
            payload: keybinding.payload,
            args: keybinding.args
        };
    }

    private withRegistrationOrder(keybinding: StaticKeybinding): StaticKeybinding {
        return {
            ...keybinding,
            registrationOrder: this.nextRegistrationOrder++
        };
    }
}

// 导出单例实例
export const keybindingManager = new KeybindingManager();
