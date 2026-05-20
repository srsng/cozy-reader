import { describe, expect, it, vi } from 'vitest';
import { CommandService } from '$lib/commands/commandService';
import { ContextKey } from '$lib/context-keys';
import { MenuId } from '$lib/menus';
import { ModifierKey } from '$lib/keybindings/types';
import { createAppCommandHarness, setAppContextState } from '$lib/testing';
import { registerAction } from './actionRegistry';
import type { ActionDefinition } from './types';

function createServices() {
    return createAppCommandHarness({ registerCommandExecutor: false });
}

describe('registerAction', () => {
    it('registers command, menu contribution, and keybinding together', async () => {
        const { commandService, menuService, keybindingManager } = createServices();
        const run = vi.fn();
        const action: ActionDefinition = {
            id: 'zoom.in',
            title: '放大',
            description: '增加缩放',
            category: 'zoom',
            keywords: ['zoom'],
            command: { run },
            menus: [
                {
                    menu: MenuId.CommandPalette,
                    order: 1,
                    defaultShortcut: 'Ctrl+='
                }
            ],
            keybindings: [
                {
                    combination: { key: '=', modifiers: [ModifierKey.Ctrl] }
                }
            ]
        };

        registerAction(action, { commandService, menuService, keybindingManager });

        expect(await commandService.execute('zoom.in')).toBe(true);
        expect(run).toHaveBeenCalledOnce();
        expect(menuService.getVisibleItems(MenuId.CommandPalette)[0].title).toBe('放大');
        expect(
            keybindingManager.getKeybindingsForInvocation({ commandId: 'zoom.in' })
        ).toHaveLength(1);
    });

    it('disposes all contributions registered by an action', async () => {
        const { commandService, menuService, keybindingManager } = createServices();
        const action: ActionDefinition = {
            id: 'zoom.in',
            title: '放大',
            category: 'zoom',
            command: { run: vi.fn() },
            menus: [
                {
                    menu: MenuId.CommandPalette
                }
            ],
            keybindings: [
                {
                    combination: { key: '=', modifiers: [ModifierKey.Ctrl] }
                }
            ]
        };

        const disposable = registerAction(action, {
            commandService,
            menuService,
            keybindingManager
        });
        disposable.dispose();

        expect(await commandService.execute('zoom.in')).toBe(false);
        expect(menuService.getVisibleItems(MenuId.CommandPalette)).toHaveLength(0);
        expect(
            keybindingManager.getKeybindingsForInvocation({ commandId: 'zoom.in' })
        ).toHaveLength(0);
    });

    it('rolls back command registration when menu registration fails', () => {
        const { commandService, menuService, keybindingManager } = createServices();
        const firstAction: ActionDefinition = {
            id: 'zoom.in',
            title: '放大',
            category: 'zoom',
            command: { run: vi.fn() },
            menus: [{ menu: MenuId.CommandPalette }]
        };
        const secondAction: ActionDefinition = {
            id: 'zoom.out',
            title: '缩小',
            category: 'zoom',
            command: { run: vi.fn() },
            menus: [{ id: 'zoom.in', menu: MenuId.CommandPalette }],
            keybindings: [{ combination: { key: '-', modifiers: [ModifierKey.Ctrl] } }]
        };

        registerAction(firstAction, { commandService, menuService, keybindingManager });

        expect(() =>
            registerAction(secondAction, { commandService, menuService, keybindingManager })
        ).toThrow('Overwriting menu contribution: commandPalette:zoom.in');

        expect(commandService.findCommand('zoom.out')).toBeUndefined();
        expect(
            keybindingManager.getKeybindingsForInvocation({ commandId: 'zoom.out' })
        ).toHaveLength(0);
    });

    it('adds text input, dialog, and command palette guards to action keybindings by default', () => {
        const { commandService, menuService, keybindingManager, context } = createServices();
        keybindingManager.setContextKeyService(context.contextKeys);
        const action: ActionDefinition = {
            id: 'window.toggleDevtools',
            title: '打开开发者工具',
            category: 'window',
            command: {
                enablement: ContextKey.WindowDevtoolsAvailable,
                run: vi.fn()
            },
            keybindings: [
                {
                    combination: { key: 'i', modifiers: [ModifierKey.Ctrl, ModifierKey.Shift] }
                }
            ]
        };

        registerAction(action, { commandService, menuService, keybindingManager });
        setAppContextState(context.appState, ContextKey.WindowDevtoolsAvailable, true);
        setAppContextState(context.appState, ContextKey.TextInputFocus, false);
        setAppContextState(context.appState, ContextKey.DialogOpen, false);
        setAppContextState(context.appState, ContextKey.CommandPaletteOpen, false);

        const combination = { key: 'i', modifiers: [ModifierKey.Ctrl, ModifierKey.Shift] };
        expect(keybindingManager.inspect(combination).matched?.commandId).toBe(
            'window.toggleDevtools'
        );

        setAppContextState(context.appState, ContextKey.TextInputFocus, true);
        expect(keybindingManager.inspect(combination).matched).toBeNull();

        setAppContextState(context.appState, ContextKey.TextInputFocus, false);
        setAppContextState(context.appState, ContextKey.DialogOpen, true);
        expect(keybindingManager.inspect(combination).matched).toBeNull();

        setAppContextState(context.appState, ContextKey.DialogOpen, false);
        setAppContextState(context.appState, ContextKey.CommandPaletteOpen, true);
        expect(keybindingManager.inspect(combination).matched).toBeNull();
    });

    it('can opt action keybindings into command palette execution', () => {
        const { commandService, menuService, keybindingManager, context } = createServices();
        keybindingManager.setContextKeyService(context.contextKeys);
        const action: ActionDefinition = {
            id: 'zoom.in',
            title: '放大',
            category: 'zoom',
            command: { run: vi.fn() },
            keybindings: [
                {
                    combination: { key: '=', modifiers: [ModifierKey.Ctrl] },
                    allowWhenCommandPaletteOpen: true
                }
            ]
        };

        registerAction(action, { commandService, menuService, keybindingManager });
        setAppContextState(context.appState, ContextKey.CommandPaletteOpen, true);
        setAppContextState(context.appState, ContextKey.TextInputFocus, true);

        expect(
            keybindingManager.inspect({ key: '=', modifiers: [ModifierKey.Ctrl] }).matched
                ?.commandId
        ).toBe('zoom.in');

        setAppContextState(context.appState, ContextKey.CommandPaletteOpen, false);

        expect(
            keybindingManager.inspect({ key: '=', modifiers: [ModifierKey.Ctrl] }).matched
        ).toBeNull();
    });

    it('adds command scope to menu and keybinding invocations', async () => {
        const { commandRouter, context, menuService, keybindingManager } = createServices();
        const readerCommandService = new CommandService(context);
        commandRouter.registerScope('reader', readerCommandService);
        const run = vi.fn();
        const action: ActionDefinition = {
            id: 'reader.page.next',
            title: '下一页',
            category: 'reader',
            command: { run },
            menus: [{ menu: MenuId.CommandPalette }],
            keybindings: [
                {
                    combination: { key: 'Right', modifiers: [] }
                }
            ]
        };

        registerAction(action, {
            commandScope: 'reader',
            commandService: readerCommandService,
            menuService,
            keybindingManager
        });

        expect(menuService.getItem(MenuId.CommandPalette, 'reader.page.next')?.invocation).toEqual({
            scope: 'reader',
            commandId: 'reader.page.next',
            payload: undefined,
            args: undefined
        });
        expect(
            keybindingManager.getKeybindingsForInvocation({
                scope: 'reader',
                commandId: 'reader.page.next'
            })
        ).toHaveLength(1);
        expect(
            await commandRouter.executeInvocation({ scope: 'reader', commandId: action.id })
        ).toBe(true);
        expect(run).toHaveBeenCalledOnce();
    });

    it('merges action requirements into command, menu, and keybinding conditions', async () => {
        const { commandService, menuService, keybindingManager, context } = createServices();
        const action: ActionDefinition = {
            id: 'window.toggleDevtools',
            title: '打开开发者工具',
            category: 'window',
            requires: ContextKey.WindowDevtoolsAvailable,
            command: { run: vi.fn() },
            menus: [{ menu: MenuId.CommandPalette }],
            keybindings: [
                {
                    combination: { key: 'i', modifiers: [ModifierKey.Ctrl, ModifierKey.Shift] },
                    allowWhenCommandPaletteOpen: true
                }
            ]
        };

        registerAction(action, { commandService, menuService, keybindingManager });
        const combination = { key: 'i', modifiers: [ModifierKey.Ctrl, ModifierKey.Shift] };

        setAppContextState(context.appState, ContextKey.WindowDevtoolsAvailable, false);
        expect(await commandService.execute('window.toggleDevtools')).toBe(false);
        expect(menuService.getVisibleItems(MenuId.CommandPalette)).toHaveLength(0);
        expect(keybindingManager.inspect(combination).matched).toBeNull();

        setAppContextState(context.appState, ContextKey.WindowDevtoolsAvailable, true);
        expect(await commandService.execute('window.toggleDevtools')).toBe(true);
        expect(menuService.getVisibleItems(MenuId.CommandPalette)).toHaveLength(1);
        expect(keybindingManager.inspect(combination).matched?.commandId).toBe(
            'window.toggleDevtools'
        );
    });

    it('keeps action requirements when keybindings define their own conditions', () => {
        const { commandService, menuService, keybindingManager, context } = createServices();
        keybindingManager.setContextKeyService(context.contextKeys);
        const action: ActionDefinition = {
            id: 'window.toggleDevtools',
            title: '打开开发者工具',
            category: 'window',
            requires: ContextKey.WindowDevtoolsAvailable,
            command: { run: vi.fn() },
            keybindings: [
                {
                    combination: { key: 'i', modifiers: [ModifierKey.Ctrl, ModifierKey.Shift] },
                    when: ContextKey.CommandPaletteOpen,
                    allowWhenCommandPaletteOpen: true
                }
            ]
        };

        registerAction(action, { commandService, menuService, keybindingManager });
        const combination = { key: 'i', modifiers: [ModifierKey.Ctrl, ModifierKey.Shift] };

        setAppContextState(context.appState, ContextKey.CommandPaletteOpen, true);
        setAppContextState(context.appState, ContextKey.WindowDevtoolsAvailable, false);
        expect(keybindingManager.inspect(combination).matched).toBeNull();

        setAppContextState(context.appState, ContextKey.WindowDevtoolsAvailable, true);
        expect(keybindingManager.inspect(combination).matched?.commandId).toBe(
            'window.toggleDevtools'
        );
    });

    it('selects platform-specific keybinding combinations', () => {
        const { commandService, menuService, keybindingManager } = createServices();
        const action: ActionDefinition = {
            id: 'navigate.settings',
            title: '打开设置',
            category: 'navigation',
            command: { run: vi.fn() },
            keybindings: [
                {
                    combination: { key: ',', modifiers: [ModifierKey.Ctrl] },
                    platforms: {
                        macos: { key: ',', modifiers: [ModifierKey.Meta] }
                    }
                }
            ]
        };

        registerAction(action, {
            commandService,
            menuService,
            keybindingManager,
            platform: 'macos'
        });

        expect(
            keybindingManager.inspect({ key: ',', modifiers: [ModifierKey.Ctrl] }).matched
        ).toBeNull();
        expect(
            keybindingManager.inspect({ key: ',', modifiers: [ModifierKey.Meta] }).matched
                ?.commandId
        ).toBe('navigate.settings');
    });

    it('skips platform-disabled keybindings', () => {
        const { commandService, menuService, keybindingManager } = createServices();
        const action: ActionDefinition = {
            id: 'navigate.settings',
            title: '打开设置',
            category: 'navigation',
            command: { run: vi.fn() },
            keybindings: [
                {
                    combination: { key: ',', modifiers: [ModifierKey.Ctrl] },
                    platforms: { linux: false }
                }
            ]
        };

        registerAction(action, {
            commandService,
            menuService,
            keybindingManager,
            platform: 'linux'
        });

        expect(
            keybindingManager.getKeybindingsForInvocation({ commandId: 'navigate.settings' })
        ).toHaveLength(0);
    });
});
