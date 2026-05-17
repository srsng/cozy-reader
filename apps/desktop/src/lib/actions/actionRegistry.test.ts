import { describe, expect, it, vi } from 'vitest';
import { CommandRouter } from '$lib/commands/commandRouter';
import { CommandService } from '$lib/commands/commandService';
import type { CommandContext } from '$lib/commands/types';
import { ContextKey, ContextKeyService } from '$lib/context-keys';
import { MenuId, MenuService } from '$lib/menus';
import { KeybindingManager } from '$lib/keybindings/keybindingManager';
import { ModifierKey } from '$lib/keybindings/types';
import { writable } from 'svelte/store';
import { DEFAULT_APP_STATE } from '$lib/state/app-state';
import type { UserSettings } from '$lib/settings';
import { LogLevel } from '$lib/types';
import { registerAction } from './actionRegistry';
import type { ActionDefinition } from './types';

function createSettings(): UserSettings {
    return {
        base: {
            langCode: 'zh-cn',
            logLevel: LogLevel.info,
            zoom: 1,
            alwaysOnTop: false,
            uiOpacity: 0.88,
            bodyTransparent: 1,
            layoutControlsOutline: true
        },
        layout: {
            titlebar: true,
            header: true,
            footer: true,
            layoutConfigs: {
                titlebar: { left: [], center: [], right: [] },
                footbar: { left: [], center: [], right: [] },
                sidebar: { left: [], center: [], right: [] }
            }
        },
        theme: {
            mode: 'system',
            type: 'standard',
            data: {
                standard: { name: 'black' },
                four_colors: { hue: 36 },
                pony: { name: 'sg' }
            },
            effects: 'none'
        },
        reader: {
            fontFamily: '',
            viewerWidth: 60,
            fontSize: 20,
            lineHeight: 180,
            firstLineIndent: false,
            zoomLongPic: false,
            scrollBarVisable: false
        },
        background: {} as UserSettings['background'],
        keybindings: { rules: [] }
    };
}

function createServices() {
    const context: CommandContext = {
        appState: writable(DEFAULT_APP_STATE),
        contextKeys: new ContextKeyService(),
        navigation: { settings: vi.fn() },
        theme: { setEffect: vi.fn() },
        userSettings: writable(createSettings()),
        window: {
            close: vi.fn(),
            maximize: vi.fn(),
            minimize: vi.fn(),
            refresh: vi.fn(),
            requestUserAttention: vi.fn(),
            restoreState: vi.fn(),
            saveState: vi.fn(),
            setAlwaysOnTop: vi.fn(),
            toggleDevtools: vi.fn(),
            toggleFullscreen: vi.fn()
        }
    };
    const commandService = new CommandService(context);
    const commandRouter = new CommandRouter();
    commandRouter.registerScope('app', commandService);
    const menuService = new MenuService(commandRouter, context.contextKeys);
    const keybindingManager = new KeybindingManager();

    return { commandRouter, commandService, menuService, keybindingManager, context };
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

    it('adds text input and dialog guards to action keybindings by default', () => {
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
        context.contextKeys.set(ContextKey.WindowDevtoolsAvailable, true);
        context.contextKeys.set(ContextKey.TextInputFocus, false);
        context.contextKeys.set(ContextKey.DialogOpen, false);

        const combination = { key: 'i', modifiers: [ModifierKey.Ctrl, ModifierKey.Shift] };
        expect(keybindingManager.inspect(combination).matched?.commandId).toBe(
            'window.toggleDevtools'
        );

        context.contextKeys.set(ContextKey.TextInputFocus, true);
        expect(keybindingManager.inspect(combination).matched).toBeNull();

        context.contextKeys.set(ContextKey.TextInputFocus, false);
        context.contextKeys.set(ContextKey.DialogOpen, true);
        expect(keybindingManager.inspect(combination).matched).toBeNull();
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
});
