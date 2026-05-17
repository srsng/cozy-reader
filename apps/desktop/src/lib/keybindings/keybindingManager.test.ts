import { describe, expect, it, vi } from 'vitest';
import { KeybindingManager } from './keybindingManager';
import { ModifierKey, type StaticKeybinding } from './types';
import { KeybindingUtils } from './keybindingListener';
import { parseUserKeybindingRules } from './userKeybindings';
import type { CommandInvocation } from '$lib/commands/types';
import { ContextKey, ContextKeyService } from '$lib/context-keys';

const baseKeybinding: StaticKeybinding = {
    id: 'zoom.in',
    name: '放大',
    description: '放大',
    combination: { key: '=', modifiers: [ModifierKey.Ctrl] },
    commandId: 'zoom.in',
    source: 'default'
};

function createKeyboardEvent(key: string, options: Partial<KeyboardEvent> = {}) {
    return {
        key,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        target: {
            tagName: 'div',
            contentEditable: 'false',
            parentElement: null
        },
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        ...options
    } as unknown as KeyboardEvent & {
        preventDefault: ReturnType<typeof vi.fn>;
        stopPropagation: ReturnType<typeof vi.fn>;
    };
}

function startWithCapturedKeydown(manager: KeybindingManager) {
    let keydown: ((event: KeyboardEvent) => void) | undefined;
    const documentMock = {
        addEventListener: vi.fn((_type: string, listener: (event: KeyboardEvent) => void) => {
            keydown = listener;
        }),
        removeEventListener: vi.fn()
    };

    vi.stubGlobal('document', documentMock);
    manager.init();

    return {
        documentMock,
        keydown: (event: KeyboardEvent) => keydown?.(event)
    };
}

describe('KeybindingManager', () => {
    it('disposes registered keybindings', () => {
        const manager = new KeybindingManager();
        const disposable = manager.register(baseKeybinding);

        expect(manager.getKeybindingsForCommand('zoom.in')).toHaveLength(1);

        disposable.dispose();

        expect(manager.getKeybindingsForCommand('zoom.in')).toHaveLength(0);
    });

    it('does not let an old disposable remove an overwritten keybinding', () => {
        const manager = new KeybindingManager();
        const firstDisposable = manager.register(baseKeybinding);

        manager.register({
            ...baseKeybinding,
            name: '自定义放大',
            source: 'user'
        });
        firstDisposable.dispose();

        expect(manager.getKeybindingsForCommand('zoom.in')).toHaveLength(1);
        expect(manager.getKeybindingsForCommand('zoom.in')[0].name).toBe('自定义放大');
    });

    it('rolls back registerKeybindings when registration fails', () => {
        class ThrowingKeybindingManager extends KeybindingManager {
            override register(keybinding: StaticKeybinding) {
                if (keybinding.id === 'fail') throw new Error('registration failed');
                return super.register(keybinding);
            }
        }

        const manager = new ThrowingKeybindingManager();

        expect(() =>
            manager.registerKeybindings([
                {
                    ...baseKeybinding,
                    id: 'temporary'
                },
                {
                    ...baseKeybinding,
                    id: 'fail'
                }
            ])
        ).toThrow('registration failed');

        expect(manager.getKeybindingsForCommand('zoom.in')).toHaveLength(0);
    });

    it('resolves later same-source registrations before earlier registrations', () => {
        const manager = new KeybindingManager();
        manager.register({
            ...baseKeybinding,
            id: 'first-default'
        });
        manager.register({
            ...baseKeybinding,
            id: 'second-default'
        });

        expect(manager.inspect({ key: '=', modifiers: [ModifierKey.Ctrl] }).matched?.id).toBe(
            'second-default'
        );
    });

    it('parses user keybinding strings with normalized keys and modifiers', () => {
        expect(KeybindingUtils.stringToCombination('Ctrl+Shift+P')).toEqual({
            key: 'p',
            modifiers: [ModifierKey.Ctrl, ModifierKey.Shift]
        });
        expect(KeybindingUtils.stringToCombination('Cmd+F')).toEqual({
            key: 'f',
            modifiers: [ModifierKey.Meta]
        });
        expect(KeybindingUtils.stringToCombination('Escape')).toEqual({
            key: 'Esc',
            modifiers: []
        });
        expect(KeybindingUtils.stringToCombination('ArrowLeft')).toEqual({
            key: 'Left',
            modifiers: []
        });
    });

    it('applies and disposes user keybinding overrides', () => {
        const manager = new KeybindingManager();
        manager.setContextKeyService(new ContextKeyService());
        manager.register(baseKeybinding);

        const disposable = manager.applyUserKeybindingRules([
            {
                id: 'zoom.in',
                commandId: 'zoom.in',
                key: 'Ctrl+Shift+='
            }
        ]);

        expect(manager.inspect({ key: '=', modifiers: [ModifierKey.Ctrl] }).matched).toBeNull();
        expect(
            manager.inspect({ key: '=', modifiers: [ModifierKey.Ctrl, ModifierKey.Shift] }).matched
                ?.source
        ).toBe('user');
        expect(manager.getKeybindingsForInvocation({ commandId: 'zoom.in' })[0].source).toBe(
            'user'
        );

        disposable.dispose();

        expect(manager.inspect({ key: '=', modifiers: [ModifierKey.Ctrl] }).matched?.source).toBe(
            'default'
        );
    });

    it('lets later user keybinding rules win for the same key combination', () => {
        const manager = new KeybindingManager();
        manager.setContextKeyService(new ContextKeyService());
        const disposable = manager.applyUserKeybindingRules([
            {
                id: 'user-zoom-in',
                commandId: 'zoom.in',
                key: 'Ctrl+='
            },
            {
                id: 'user-zoom-out',
                commandId: 'zoom.out',
                key: 'Ctrl+='
            }
        ]);

        expect(
            manager.inspect({ key: '=', modifiers: [ModifierKey.Ctrl] }).matched?.commandId
        ).toBe('zoom.out');

        disposable.dispose();
        expect(manager.inspect({ key: '=', modifiers: [ModifierKey.Ctrl] }).matched).toBeNull();
    });

    it('applies and disposes user disabled keybinding rules', () => {
        const manager = new KeybindingManager();
        manager.setContextKeyService(new ContextKeyService());
        manager.register({
            ...baseKeybinding,
            id: 'reader.page-next-l',
            combination: { key: 'l', modifiers: [] },
            commandId: 'reader.page.next'
        });

        const disposable = manager.applyUserKeybindingRules([
            {
                id: 'reader.page-next-l',
                disabled: true
            }
        ]);

        expect(manager.getKeybindingsForCommand('reader.page.next')).toHaveLength(0);

        disposable.dispose();

        expect(manager.getKeybindingsForCommand('reader.page.next')).toHaveLength(1);
    });

    it('adds text input and dialog guards to user keybindings unless explicitly allowed', () => {
        const manager = new KeybindingManager();
        const contextKeys = new ContextKeyService();
        manager.setContextKeyService(contextKeys);
        manager.applyUserKeybindingRules([
            {
                id: 'user-zoom-in',
                commandId: 'zoom.in',
                key: 'Ctrl+='
            },
            {
                id: 'user-show-commands',
                commandId: 'app.showCommands',
                key: 'Ctrl+Shift+P',
                allowInTextInput: true,
                allowWhenDialogOpen: true
            }
        ]);

        expect(manager.inspect({ key: '=', modifiers: [ModifierKey.Ctrl] }).matched?.id).toBe(
            'user-zoom-in'
        );
        contextKeys.set(ContextKey.TextInputFocus, true);
        expect(manager.inspect({ key: '=', modifiers: [ModifierKey.Ctrl] }).matched).toBeNull();
        expect(
            manager.inspect({ key: 'p', modifiers: [ModifierKey.Ctrl, ModifierKey.Shift] }).matched
                ?.id
        ).toBe('user-show-commands');

        contextKeys.set(ContextKey.TextInputFocus, false);
        contextKeys.set(ContextKey.DialogOpen, true);
        expect(manager.inspect({ key: '=', modifiers: [ModifierKey.Ctrl] }).matched).toBeNull();
    });

    it('does not intercept command keybindings that cannot execute', () => {
        const manager = new KeybindingManager();
        const canExecute = vi.fn((_invocation: CommandInvocation) => false);
        const execute = vi.fn();
        manager.register(baseKeybinding);
        manager.setCommandExecutor({ canExecute, execute });

        const event = createKeyboardEvent('=', { ctrlKey: true });

        try {
            const { keydown } = startWithCapturedKeydown(manager);
            keydown(event);
        } finally {
            manager.stopListening();
            vi.unstubAllGlobals();
        }

        expect(canExecute).toHaveBeenCalledWith(expect.objectContaining({ commandId: 'zoom.in' }));
        expect(execute).not.toHaveBeenCalled();
        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(event.stopPropagation).not.toHaveBeenCalled();
    });

    it('intercepts and executes command keybindings only after canExecute passes', () => {
        const manager = new KeybindingManager();
        const canExecute = vi.fn((_invocation: CommandInvocation) => true);
        const execute = vi.fn(() => true);
        manager.register(baseKeybinding);
        manager.setCommandExecutor({ canExecute, execute });

        const event = createKeyboardEvent('=', { ctrlKey: true });

        try {
            const { keydown } = startWithCapturedKeydown(manager);
            keydown(event);
        } finally {
            manager.stopListening();
            vi.unstubAllGlobals();
        }

        expect(canExecute).toHaveBeenCalledWith(expect.objectContaining({ commandId: 'zoom.in' }));
        expect(execute).toHaveBeenCalledWith(expect.objectContaining({ commandId: 'zoom.in' }));
        expect(event.preventDefault).toHaveBeenCalledOnce();
        expect(event.stopPropagation).toHaveBeenCalledOnce();
    });

    it('does not trigger command keybindings that cannot execute', () => {
        const manager = new KeybindingManager();
        const canExecute = vi.fn((_invocation: CommandInvocation) => false);
        const execute = vi.fn();
        manager.register(baseKeybinding);
        manager.setCommandExecutor({ canExecute, execute });

        expect(manager.trigger('zoom.in')).toBe(false);
        expect(canExecute).toHaveBeenCalledWith(expect.objectContaining({ commandId: 'zoom.in' }));
        expect(execute).not.toHaveBeenCalled();
    });

    it('stops listening without clearing registered keybindings', () => {
        const documentMock = {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        };
        const manager = new KeybindingManager();
        manager.register(baseKeybinding);

        vi.stubGlobal('document', documentMock);
        try {
            manager.init();
            manager.stopListening();
        } finally {
            vi.unstubAllGlobals();
        }

        expect(manager.getKeybindingsForCommand('zoom.in')).toHaveLength(1);
        expect(documentMock.addEventListener).toHaveBeenCalledOnce();
        expect(documentMock.removeEventListener).toHaveBeenCalledOnce();
    });

    it('ignores invalid user keybinding rules', () => {
        expect(
            parseUserKeybindingRules([
                { id: 'zoom.in', commandId: 'zoom.in', key: 'Ctrl+Super+=' },
                { id: 'zoom.out', disabled: true }
            ])
        ).toEqual([{ id: 'zoom.out', disabled: true }]);
    });
});
