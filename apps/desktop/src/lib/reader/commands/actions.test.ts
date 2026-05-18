import { describe, expect, it, vi } from 'vitest';
import { writable, type Writable } from 'svelte/store';
import type { UserSettings } from '$lib/settings';
import { LogLevel } from '$lib/types';
import { DEFAULT_APP_STATE, type AppState } from '$lib/state/app-state';
import { CommandRouter } from '$lib/commands/commandRouter';
import { CommandService } from '$lib/commands/commandService';
import type { CommandContext } from '$lib/commands/types';
import { ContextKey, ContextKeyService } from '$lib/context-keys';
import { MenuId, MenuService } from '$lib/menus';
import { KeybindingManager } from '$lib/keybindings/keybindingManager';
import { registerDefaultActions } from '$lib/actions';
import { ReaderContextKey } from './contextKeys';
import {
    canExecuteReaderCommand,
    createReaderCommandInvocation,
    executeReaderCommand,
    READER_COMMAND_SCOPE,
    ReaderCommandId,
    registerReaderActions
} from './actions';
import type { ReaderCommandRuntime } from './runtime';

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

function createReaderRuntime(
    options: { activeBookKey?: string; hasBook?: boolean; settingsOpen?: boolean } = {}
): ReaderCommandRuntime {
    return {
        closeSettings: vi.fn(),
        getActiveBookKey: vi.fn(() => options.activeBookKey),
        hasBook: vi.fn(() => Boolean(options.hasBook)),
        hasSettingsOpen: vi.fn(() => Boolean(options.settingsOpen)),
        nextPage: vi.fn(),
        nextSection: vi.fn(),
        openSearch: vi.fn(),
        openSettings: vi.fn(),
        previousPage: vi.fn(),
        previousSection: vi.fn(),
        toggleNotebook: vi.fn(),
        toggleSidebar: vi.fn()
    };
}

function createServices(runtime: ReaderCommandRuntime) {
    const userSettings = writable(createSettings());
    const appState = writable<AppState>(DEFAULT_APP_STATE);
    const context: CommandContext = {
        appState,
        contextKeys: new ContextKeyService(),
        navigation: {
            back: vi.fn(),
            backgroundSettings: vi.fn(),
            canGoBack: vi.fn(() => true),
            home: vi.fn(),
            settings: vi.fn()
        },
        theme: { setEffect: vi.fn() },
        userSettings,
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
    const commandRouter = new CommandRouter();
    const commandService = new CommandService(context);
    const readerCommandService = new CommandService(context);
    commandRouter.registerScope('app', commandService);
    commandRouter.registerScope(READER_COMMAND_SCOPE, readerCommandService);
    const menuService = new MenuService(commandRouter, context.contextKeys);
    const keybindingManager = new KeybindingManager();
    keybindingManager.setContextKeyService(context.contextKeys);
    keybindingManager.setCommandExecutor(commandRouter);

    registerDefaultActions({ commandService, menuService, keybindingManager });
    const readerDisposable = registerReaderActions(
        {
            commandScope: READER_COMMAND_SCOPE,
            commandService: readerCommandService,
            menuService,
            keybindingManager
        },
        runtime
    );

    return {
        commandRouter,
        commandService,
        menuService,
        keybindingManager,
        context,
        readerDisposable
    };
}

describe('reader command actions', () => {
    it('registers reader commands through palette and keybindings when a book is active', async () => {
        const runtime = createReaderRuntime({ activeBookKey: 'book-1', hasBook: true });
        const { commandRouter, menuService, keybindingManager, context } = createServices(runtime);
        context.contextKeys.set(ReaderContextKey.BookOpen, true);
        context.contextKeys.set(ReaderContextKey.ActiveBookKey, 'book-1');
        context.contextKeys.set(ReaderContextKey.SettingsOpen, false);
        context.contextKeys.set(ContextKey.TextInputFocus, false);

        expect(await executeReaderCommand(commandRouter, ReaderCommandId.PageNext)).toBe(true);
        expect(runtime.nextPage).toHaveBeenCalledWith('book-1');
        expect(await executeReaderCommand(commandRouter, ReaderCommandId.SidebarToggle)).toBe(true);
        expect(runtime.toggleSidebar).toHaveBeenCalledWith('book-1');
        expect(
            await executeReaderCommand(commandRouter, ReaderCommandId.SearchOpen, {
                bookKey: 'book-2'
            })
        ).toBe(true);
        expect(runtime.openSearch).toHaveBeenCalledWith('book-2');
        expect(
            menuService
                .getVisibleItems(MenuId.CommandPalette)
                .some((item) => item.id === 'reader.page.next')
        ).toBe(true);
        expect(
            keybindingManager.getKeybindingsForInvocation({
                scope: READER_COMMAND_SCOPE,
                commandId: 'reader.page.next'
            })
        ).toHaveLength(2);
    });

    it('rejects invalid reader payloads before execution', async () => {
        const runtime = createReaderRuntime({ activeBookKey: 'book-1', hasBook: true });
        const { commandRouter, context } = createServices(runtime);
        context.contextKeys.set(ReaderContextKey.BookOpen, true);
        context.contextKeys.set(ReaderContextKey.ActiveBookKey, 'book-1');

        expect(
            commandRouter.canExecuteInvocation({
                scope: READER_COMMAND_SCOPE,
                commandId: 'reader.search.open',
                payload: { bookKey: 1 }
            })
        ).toBe(false);
        expect(
            await commandRouter.executeInvocation({
                scope: READER_COMMAND_SCOPE,
                commandId: 'reader.search.open',
                payload: { bookKey: 1 }
            })
        ).toBe(false);
        expect(runtime.openSearch).not.toHaveBeenCalled();
    });

    it('keeps reader commands disabled when no reader book is open', async () => {
        const runtime = createReaderRuntime({ activeBookKey: 'book-1', hasBook: true });
        const { commandRouter, menuService, context } = createServices(runtime);
        context.contextKeys.set(ReaderContextKey.BookOpen, false);

        expect(canExecuteReaderCommand(commandRouter, ReaderCommandId.PageNext)).toBe(false);
        expect(await executeReaderCommand(commandRouter, ReaderCommandId.PageNext)).toBe(false);
        expect(
            menuService
                .getVisibleItems(MenuId.CommandPalette)
                .some((item) => item.id === 'reader.page.next')
        ).toBe(false);
    });

    it('isolates reader navigation keybindings while the command palette is open', () => {
        const runtime = createReaderRuntime({ activeBookKey: 'book-1', hasBook: true });
        const { commandRouter, keybindingManager, context } = createServices(runtime);
        context.contextKeys.set(ReaderContextKey.BookOpen, true);
        context.contextKeys.set(ReaderContextKey.ActiveBookKey, 'book-1');
        context.contextKeys.set(ReaderContextKey.SettingsOpen, false);
        context.contextKeys.set(ContextKey.TextInputFocus, false);
        context.contextKeys.set(ContextKey.CommandPaletteOpen, false);

        expect(canExecuteReaderCommand(commandRouter, ReaderCommandId.PageNext)).toBe(true);
        expect(keybindingManager.inspect({ key: 'Right', modifiers: [] }).matched?.commandId).toBe(
            'reader.page.next'
        );

        context.contextKeys.set(ContextKey.CommandPaletteOpen, true);

        expect(canExecuteReaderCommand(commandRouter, ReaderCommandId.PageNext)).toBe(true);
        expect(keybindingManager.inspect({ key: 'Right', modifiers: [] }).matched).toBeNull();
    });

    it('uses Escape for reader settings only when command palette is not open', async () => {
        const runtime = createReaderRuntime({
            activeBookKey: 'book-1',
            hasBook: true,
            settingsOpen: true
        });
        const { commandRouter, keybindingManager, context } = createServices(runtime);
        context.contextKeys.set(ReaderContextKey.BookOpen, true);
        context.contextKeys.set(ReaderContextKey.ActiveBookKey, 'book-1');
        context.contextKeys.set(ReaderContextKey.SettingsOpen, true);
        context.contextKeys.set(ContextKey.CommandPaletteOpen, false);

        expect(await executeReaderCommand(commandRouter, ReaderCommandId.SettingsClose)).toBe(true);
        expect(runtime.closeSettings).toHaveBeenCalledWith('book-1');
        expect(keybindingManager.inspect({ key: 'Esc', modifiers: [] }).matched?.commandId).toBe(
            'reader.settings.close'
        );

        context.contextKeys.set(ContextKey.TextInputFocus, true);

        expect(keybindingManager.inspect({ key: 'Esc', modifiers: [] }).matched?.commandId).toBe(
            'reader.settings.close'
        );
        context.contextKeys.set(ContextKey.TextInputFocus, false);

        context.contextKeys.set(ContextKey.CommandPaletteOpen, true);

        expect(canExecuteReaderCommand(commandRouter, ReaderCommandId.SettingsClose)).toBe(true);
        expect(keybindingManager.inspect({ key: 'Esc', modifiers: [] }).matched?.commandId).toBe(
            'app.closeCommands'
        );
    });

    it('hides ordinary reader palette commands while reader settings are open', () => {
        const runtime = createReaderRuntime({
            activeBookKey: 'book-1',
            hasBook: true,
            settingsOpen: true
        });
        const { commandRouter, menuService, context } = createServices(runtime);
        context.contextKeys.set(ReaderContextKey.BookOpen, true);
        context.contextKeys.set(ReaderContextKey.ActiveBookKey, 'book-1');
        context.contextKeys.set(ReaderContextKey.SettingsOpen, true);

        const visibleCommandIds = menuService
            .getVisibleItems(MenuId.CommandPalette)
            .map((item) => item.id);

        expect(canExecuteReaderCommand(commandRouter, ReaderCommandId.PageNext)).toBe(false);
        expect(visibleCommandIds).not.toContain('reader.page.next');
        expect(visibleCommandIds).toContain('reader.settings.close');
    });

    it('disposes reader command contributions as a sub-application scope', async () => {
        const runtime = createReaderRuntime({ activeBookKey: 'book-1', hasBook: true });
        const { commandRouter, commandService, menuService, keybindingManager, readerDisposable } =
            createServices(runtime);

        readerDisposable.dispose();

        expect(await executeReaderCommand(commandRouter, ReaderCommandId.PageNext)).toBe(false);
        expect(menuService.getItem(MenuId.CommandPalette, 'reader.page.next')).toBeUndefined();
        expect(
            keybindingManager.getKeybindingsForInvocation({
                scope: READER_COMMAND_SCOPE,
                commandId: 'reader.page.next'
            })
        ).toHaveLength(0);
        expect(commandService.findCommand('reader.page.next')).toBeUndefined();
    });

    it('keeps reader commands out of the direct global command API types', () => {
        const runtime = createReaderRuntime({ activeBookKey: 'book-1', hasBook: true });
        const { commandRouter, commandService } = createServices(runtime);

        if (false) {
            // @ts-expect-error reader commands are runtime-scoped, not global known commands
            void commandService.execute('reader.page.next');
        }

        expect(commandService.findCommand('reader.page.next')).toBeUndefined();
        expect(canExecuteReaderCommand(commandRouter, ReaderCommandId.PageNext)).toBe(false);
    });
});
