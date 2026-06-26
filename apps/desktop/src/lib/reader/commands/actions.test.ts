import { describe, expect, it, vi } from 'vitest';
import { CommandService } from '$lib/commands/commandService';
import { ContextKey } from '$lib/context-keys';
import { MenuId } from '$lib/menus';
import { createAppCommandHarness, setAppContextState } from '$lib/testing';
import { registerDefaultActions } from '$lib/actions';
import { activateReaderCommands } from './activation';
import { readerCommandState } from '$lib/reader/stores/readerCommandState';
import { readerStore } from '$lib/reader/stores/readerStore';
import { sidebarStore } from '$lib/reader/stores/sidebarStore';
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

function expectNavigationKey(
    keybindingManager: ReturnType<typeof createServices>['keybindingManager'],
    key: string,
    commandId: ReaderCommandId
) {
    expect(keybindingManager.inspect({ key, modifiers: [] }).matched?.commandId).toBe(commandId);
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
    const harness = createAppCommandHarness();
    const { commandRouter, commandService, context, keybindingManager, menuService } = harness;
    const readerCommandService = new CommandService(context);
    commandRouter.registerScope(READER_COMMAND_SCOPE, readerCommandService);

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
        ...harness,
        commandRouter,
        commandService,
        menuService,
        keybindingManager,
        context,
        readerDisposable
    };
}

describe('reader command actions', () => {
    it('projects reader state through activation and stops emitting after disposal', async () => {
        const harness = createAppCommandHarness();
        const listener = vi.fn();
        const disposable = activateReaderCommands({
            commandRouter: harness.commandRouter,
            contextKeys: harness.context.contextKeys,
            createCommandServiceContext: () => harness.context,
            keybindingManager: harness.keybindingManager,
            menuService: harness.menuService
        });
        const unlisten = harness.context.contextKeys.onDidChange(listener);

        readerStore.setBookKeys(['book-1']);
        sidebarStore.setVisible(true);
        await Promise.resolve();

        expect(harness.context.contextKeys.get(ReaderContextKey.BookOpen)).toBe(true);
        expect(harness.context.contextKeys.get(ReaderContextKey.ActiveBookKey)).toBe('book-1');
        expect(harness.context.contextKeys.get(ReaderContextKey.SidebarVisible)).toBe(true);
        expect(listener).toHaveBeenCalled();

        listener.mockClear();
        disposable.dispose();
        expect(listener).toHaveBeenCalledOnce();
        listener.mockClear();

        readerStore.setBookKeys(['book-2']);
        await Promise.resolve();

        expect(listener).not.toHaveBeenCalled();
        expect(harness.context.contextKeys.get(ReaderContextKey.BookOpen)).toBeUndefined();

        unlisten();
        readerStore.setBookKeys([]);
        sidebarStore.setVisible(false);
        readerCommandState.setActiveBookKey(undefined);
    });

    it('registers reader commands through palette and keybindings when a book is active', async () => {
        const runtime = createReaderRuntime({ activeBookKey: 'book-1', hasBook: true });
        const { commandRouter, menuService, keybindingManager, context } = createServices(runtime);
        context.contextKeys.set(ReaderContextKey.BookOpen, true);
        context.contextKeys.set(ReaderContextKey.ActiveBookKey, 'book-1');
        context.contextKeys.set(ReaderContextKey.SettingsOpen, false);
        setAppContextState(context.appState, ContextKey.TextInputFocus, false);

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
        ).toHaveLength(4);
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
        setAppContextState(context.appState, ContextKey.TextInputFocus, false);
        setAppContextState(context.appState, ContextKey.CommandPaletteOpen, false);

        expect(canExecuteReaderCommand(commandRouter, ReaderCommandId.PageNext)).toBe(true);
        expect(keybindingManager.inspect({ key: 'Right', modifiers: [] }).matched?.commandId).toBe(
            'reader.page.next'
        );

        setAppContextState(context.appState, ContextKey.CommandPaletteOpen, true);

        expect(canExecuteReaderCommand(commandRouter, ReaderCommandId.PageNext)).toBe(true);
        expect(keybindingManager.inspect({ key: 'Right', modifiers: [] }).matched).toBeNull();
    });

    it('maps arrow keys and hjkl with vi direction semantics in vertical-section mode', () => {
        const runtime = createReaderRuntime({ activeBookKey: 'book-1', hasBook: true });
        const { keybindingManager, context } = createServices(runtime);
        context.contextKeys.set(ReaderContextKey.BookOpen, true);
        context.contextKeys.set(ReaderContextKey.ActiveBookKey, 'book-1');
        context.contextKeys.set(ReaderContextKey.SettingsOpen, false);
        context.contextKeys.set(
            ReaderContextKey.ArrowKeyNavigationMode,
            'vertical-section-horizontal-page'
        );
        setAppContextState(context.appState, ContextKey.TextInputFocus, false);
        setAppContextState(context.appState, ContextKey.CommandPaletteOpen, false);

        expectNavigationKey(keybindingManager, 'Left', ReaderCommandId.PagePrevious);
        expectNavigationKey(keybindingManager, 'h', ReaderCommandId.PagePrevious);
        expectNavigationKey(keybindingManager, 'Right', ReaderCommandId.PageNext);
        expectNavigationKey(keybindingManager, 'l', ReaderCommandId.PageNext);
        expectNavigationKey(keybindingManager, 'Up', ReaderCommandId.SectionPrevious);
        expectNavigationKey(keybindingManager, 'k', ReaderCommandId.SectionPrevious);
        expectNavigationKey(keybindingManager, 'Down', ReaderCommandId.SectionNext);
        expectNavigationKey(keybindingManager, 'j', ReaderCommandId.SectionNext);
    });

    it('maps arrow keys and hjkl with vi direction semantics in vertical-page mode', () => {
        const runtime = createReaderRuntime({ activeBookKey: 'book-1', hasBook: true });
        const { keybindingManager, context } = createServices(runtime);
        context.contextKeys.set(ReaderContextKey.BookOpen, true);
        context.contextKeys.set(ReaderContextKey.ActiveBookKey, 'book-1');
        context.contextKeys.set(ReaderContextKey.SettingsOpen, false);
        context.contextKeys.set(
            ReaderContextKey.ArrowKeyNavigationMode,
            'vertical-page-horizontal-section'
        );
        setAppContextState(context.appState, ContextKey.TextInputFocus, false);
        setAppContextState(context.appState, ContextKey.CommandPaletteOpen, false);

        expectNavigationKey(keybindingManager, 'Up', ReaderCommandId.PagePrevious);
        expectNavigationKey(keybindingManager, 'k', ReaderCommandId.PagePrevious);
        expectNavigationKey(keybindingManager, 'Down', ReaderCommandId.PageNext);
        expectNavigationKey(keybindingManager, 'j', ReaderCommandId.PageNext);
        expectNavigationKey(keybindingManager, 'Left', ReaderCommandId.SectionPrevious);
        expectNavigationKey(keybindingManager, 'h', ReaderCommandId.SectionPrevious);
        expectNavigationKey(keybindingManager, 'Right', ReaderCommandId.SectionNext);
        expectNavigationKey(keybindingManager, 'l', ReaderCommandId.SectionNext);
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
        setAppContextState(context.appState, ContextKey.CommandPaletteOpen, false);

        expect(await executeReaderCommand(commandRouter, ReaderCommandId.SettingsClose)).toBe(true);
        expect(runtime.closeSettings).toHaveBeenCalledWith('book-1');
        expect(keybindingManager.inspect({ key: 'Esc', modifiers: [] }).matched?.commandId).toBe(
            'reader.settings.close'
        );

        setAppContextState(context.appState, ContextKey.TextInputFocus, true);

        expect(keybindingManager.inspect({ key: 'Esc', modifiers: [] }).matched?.commandId).toBe(
            'reader.settings.close'
        );
        setAppContextState(context.appState, ContextKey.TextInputFocus, false);

        setAppContextState(context.appState, ContextKey.CommandPaletteOpen, true);

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
