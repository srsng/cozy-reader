import { describe, expect, it, vi } from 'vitest';
import { writable, type Writable } from 'svelte/store';
import type { UserSettings } from '$lib/settings';
import { LogLevel } from '$lib/types';
import { DEFAULT_APP_STATE, type AppState } from '$lib/state/app-state';
import { CommandService } from '$lib/commands/commandService';
import type { CommandContext } from '$lib/commands/types';
import { ContextKey, ContextKeyService } from '$lib/context-keys';
import { MenuId, MenuService } from '$lib/menus';
import { KeybindingManager } from '$lib/keybindings/keybindingManager';
import { ModifierKey } from '$lib/keybindings/types';
import { registerDefaultActions } from './defaultActions';

function getStoreValue<T>(store: Writable<T>): T {
    let value: T | undefined;
    const unsubscribe = store.subscribe((currentValue) => {
        value = currentValue;
    });
    unsubscribe();
    return value as T;
}

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
    const commandService = new CommandService(context);
    const menuService = new MenuService(commandService, context.contextKeys);
    const keybindingManager = new KeybindingManager();
    keybindingManager.setContextKeyService(context.contextKeys);

    const defaultActionsDisposable = registerDefaultActions({
        commandService,
        menuService,
        keybindingManager
    });

    return {
        commandService,
        menuService,
        keybindingManager,
        context,
        userSettings,
        defaultActionsDisposable
    };
}

describe('default actions', () => {
    it('registers zoom action command, menu item, and keybinding', async () => {
        const { commandService, menuService, keybindingManager, userSettings } = createServices();

        expect(await commandService.execute('zoom.in')).toBe(true);
        expect(getStoreValue(userSettings).base.zoom).toBe(1.0625);
        const zoomInContribution = menuService.getItem(MenuId.CommandPalette, 'zoom.in');
        const zoomOutContribution = menuService.getItem(MenuId.CommandPalette, 'zoom.out');
        const zoomResetContribution = menuService.getItem(MenuId.CommandPalette, 'zoom.reset');

        expect(zoomInContribution).toBeDefined();
        expect(zoomInContribution?.keepOpen).toBe(true);
        expect(zoomOutContribution?.keepOpen).toBe(true);
        expect(zoomResetContribution?.keepOpen).toBe(true);
        expect(zoomInContribution?.toggled).toBeUndefined();
        expect(
            keybindingManager.getKeybindingsForInvocation({ commandId: 'zoom.in' })
        ).toHaveLength(1);
    });

    it('allows zoom keybindings while the command palette input is focused', () => {
        const { keybindingManager, context } = createServices();
        const zoomIn = { key: '=', modifiers: [ModifierKey.Ctrl] };
        const zoomOut = { key: '-', modifiers: [ModifierKey.Ctrl] };
        const zoomReset = { key: '0', modifiers: [ModifierKey.Ctrl] };

        context.contextKeys.set(ContextKey.CommandPaletteOpen, true);
        context.contextKeys.set(ContextKey.TextInputFocus, true);

        expect(keybindingManager.inspect(zoomIn).matched?.commandId).toBe('zoom.in');
        expect(keybindingManager.inspect(zoomOut).matched?.commandId).toBe('zoom.out');
        expect(keybindingManager.inspect(zoomReset).matched?.commandId).toBe('zoom.reset');

        context.contextKeys.set(ContextKey.CommandPaletteOpen, false);

        expect(keybindingManager.inspect(zoomIn).matched).toBeNull();
        expect(keybindingManager.inspect(zoomOut).matched).toBeNull();
        expect(keybindingManager.inspect(zoomReset).matched).toBeNull();
    });

    it('blocks ordinary keybindings while the command palette is open', () => {
        const { keybindingManager, context } = createServices();
        const openSettings = { key: ',', modifiers: [ModifierKey.Ctrl] };

        expect(keybindingManager.inspect(openSettings).matched?.commandId).toBe(
            'navigate.settings'
        );

        context.contextKeys.set(ContextKey.CommandPaletteOpen, true);

        expect(keybindingManager.inspect(openSettings).matched).toBeNull();
    });

    it('registers navigation action through all contribution channels', async () => {
        const { commandService, menuService, keybindingManager, context } = createServices();

        expect(await commandService.execute('navigate.home')).toBe(true);
        expect(context.navigation.home).toHaveBeenCalledOnce();
        expect(await commandService.execute('navigate.settings')).toBe(true);
        expect(context.navigation.settings).toHaveBeenCalledWith(undefined);
        expect(await commandService.execute('navigate.settings', 'theme')).toBe(true);
        expect(context.navigation.settings).toHaveBeenLastCalledWith('theme');
        expect(await commandService.execute('navigate.backgroundSettings', 'overlay')).toBe(true);
        expect(context.navigation.backgroundSettings).toHaveBeenLastCalledWith('overlay');
        expect(
            await commandService.executeInvocation({
                commandId: 'navigate.settings',
                payload: { tab: 'reader' }
            })
        ).toBe(true);
        expect(context.navigation.settings).toHaveBeenLastCalledWith('reader');
        expect(
            await commandService.executeInvocation({
                commandId: 'navigate.settings',
                payload: { tab: 'invalid' }
            })
        ).toBe(false);
        expect(
            menuService
                .getVisibleItems(MenuId.CommandPalette)
                .some((item) => item.id === 'navigate.settings')
        ).toBe(true);
        expect(menuService.getItem(MenuId.TitleBar, 'navigate.home')).toBeDefined();
        expect(menuService.getItem(MenuId.TitleBar, 'navigate.settings')).toBeDefined();
        expect(menuService.getItem(MenuId.TitleBar, 'navigate.backgroundSettings')).toBeDefined();
        expect(menuService.getItem(MenuId.CommandPalette, 'navigate.settings')?.keepOpen).toBe(
            undefined
        );
        expect(
            keybindingManager.getKeybindingsForInvocation({ commandId: 'navigate.settings' })
        ).toHaveLength(1);
    });

    it('disposes default action commands, menu items, and keybindings', async () => {
        const { commandService, menuService, keybindingManager, defaultActionsDisposable } =
            createServices();

        defaultActionsDisposable.dispose();

        expect(await commandService.execute('zoom.in')).toBe(false);
        expect(menuService.getItem(MenuId.CommandPalette, 'zoom.in')).toBeUndefined();
        expect(
            keybindingManager.getKeybindingsForInvocation({ commandId: 'zoom.in' })
        ).toHaveLength(0);
    });

    it('registers always-on-top as command, menu item, and keybinding', async () => {
        const { commandService, menuService, keybindingManager, context, userSettings } =
            createServices();

        expect(await commandService.execute('window.toggleAlwaysOnTop')).toBe(true);
        expect(getStoreValue(userSettings).base.alwaysOnTop).toBe(true);
        expect(context.window.setAlwaysOnTop).toHaveBeenCalledWith(true);
        expect(
            menuService
                .getVisibleItems(MenuId.CommandPalette)
                .some((item) => item.id === 'window.toggleAlwaysOnTop')
        ).toBe(true);
        expect(
            keybindingManager.getKeybindingsForInvocation({
                commandId: 'window.toggleAlwaysOnTop'
            })
        ).toHaveLength(1);
    });

    it('does not update always-on-top state when toggling fails', async () => {
        const { commandService, context, userSettings } = createServices();
        context.contextKeys.set(ContextKey.WindowAlwaysOnTop, false);
        vi.mocked(context.window.setAlwaysOnTop).mockRejectedValue(new Error('platform failed'));

        await expect(commandService.execute('window.toggleAlwaysOnTop')).rejects.toThrow(
            'platform failed'
        );

        expect(getStoreValue(userSettings).base.alwaysOnTop).toBe(false);
        expect(context.contextKeys.get(ContextKey.WindowAlwaysOnTop)).toBe(false);
    });

    it('registers concrete theme effect menu entries for the parameterized action', async () => {
        const { commandService, menuService, context, userSettings } = createServices();

        const blurThemeContribution = menuService
            .getVisibleItems(MenuId.CommandPalette)
            .find((contribution) => contribution.id === 'theme.effects.blur');

        expect(commandService.canExecuteInvocation({ commandId: 'theme.effects.set' })).toBe(false);
        expect(await commandService.executeInvocation({ commandId: 'theme.effects.set' })).toBe(
            false
        );
        expect(
            commandService.canExecuteInvocation({
                commandId: 'theme.effects.set',
                payload: { effect: 'invalid' }
            })
        ).toBe(false);
        expect(
            await commandService.executeInvocation({
                commandId: 'theme.effects.set',
                payload: { effect: 'invalid' }
            })
        ).toBe(false);
        expect(blurThemeContribution).toBeDefined();
        expect(await menuService.execute(blurThemeContribution!)).toBe(true);
        expect(getStoreValue(userSettings).theme.effects).toBe('blur');
        expect(context.theme.setEffect).toHaveBeenCalledWith('blur');
    });

    it('does not update theme effect state when the platform command fails', async () => {
        const { commandService, context, userSettings } = createServices();
        context.contextKeys.set(ContextKey.ThemeEffects, 'none');
        vi.mocked(context.theme.setEffect).mockRejectedValue(new Error('platform failed'));

        await expect(commandService.execute('theme.effects.set', 'blur')).rejects.toThrow(
            'platform failed'
        );

        expect(getStoreValue(userSettings).theme.effects).toBe('none');
        expect(context.contextKeys.get(ContextKey.ThemeEffects)).toBe('none');
    });

    it('registers window chrome actions in the command palette', async () => {
        const { commandService, menuService, context } = createServices();
        context.contextKeys.set(ContextKey.WindowDevtoolsAvailable, true);

        expect(await commandService.execute('window.maximize')).toBe(true);
        expect(context.window.maximize).toHaveBeenCalledOnce();
        expect(context.window.saveState).toHaveBeenCalledOnce();
        expect(await commandService.execute('window.toggleDevtools')).toBe(true);
        expect(context.window.toggleDevtools).toHaveBeenCalledOnce();
        expect(
            menuService
                .getVisibleItems(MenuId.CommandPalette)
                .some((item) => item.id === 'window.toggleDevtools')
        ).toBe(true);
    });

    it('routes refresh keybindings through the window refresh command', () => {
        const { keybindingManager, context } = createServices();
        const ctrlR = { key: 'r', modifiers: [ModifierKey.Ctrl] };
        const f5 = { key: 'f5', modifiers: [] };

        expect(keybindingManager.inspect(ctrlR).matched?.commandId).toBe('window.refresh');
        expect(keybindingManager.inspect(f5).matched?.commandId).toBe('window.refresh');
        expect(
            keybindingManager.getKeybindingsForInvocation({ commandId: 'window.refresh' })
        ).toHaveLength(2);

        context.contextKeys.set(ContextKey.TextInputFocus, true);
        context.contextKeys.set(ContextKey.DialogOpen, true);
        context.contextKeys.set(ContextKey.CommandPaletteOpen, true);

        expect(keybindingManager.inspect(ctrlR).matched?.commandId).toBe('window.refresh');
        expect(keybindingManager.inspect(f5).matched?.commandId).toBe('window.refresh');
    });

    it('hides and disables DevTools when the runtime capability is unavailable', async () => {
        const { commandService, menuService, context } = createServices();
        context.contextKeys.set(ContextKey.WindowDevtoolsAvailable, false);

        expect(commandService.canExecute('window.toggleDevtools')).toBe(false);
        expect(await commandService.execute('window.toggleDevtools')).toBe(false);
        expect(context.window.toggleDevtools).not.toHaveBeenCalled();
        expect(
            menuService
                .getVisibleItems(MenuId.CommandPalette)
                .some((item) => item.id === 'window.toggleDevtools')
        ).toBe(false);
    });

    it('toggles the command palette from text inputs, dialogs, and the open palette', async () => {
        const { commandService, keybindingManager, context } = createServices();
        const showCommands = { key: 'p', modifiers: [ModifierKey.Ctrl] };
        const showCommandsF1 = { key: 'f1', modifiers: [] };
        const closeCommands = { key: 'Esc', modifiers: [] };

        expect(context.contextKeys.get(ContextKey.CommandPaletteOpen)).toBeUndefined();

        expect(await commandService.execute('app.showCommands')).toBe(true);
        expect(context.contextKeys.get(ContextKey.CommandPaletteOpen)).toBe(true);

        expect(await commandService.execute('app.showCommands')).toBe(true);
        expect(context.contextKeys.get(ContextKey.CommandPaletteOpen)).toBe(false);

        context.contextKeys.set(ContextKey.TextInputFocus, true);
        context.contextKeys.set(ContextKey.DialogOpen, true);

        expect(keybindingManager.inspect(showCommands).matched?.commandId).toBe('app.showCommands');
        expect(keybindingManager.inspect(showCommandsF1).matched?.commandId).toBe(
            'app.showCommands'
        );

        context.contextKeys.set(ContextKey.CommandPaletteOpen, true);

        expect(keybindingManager.inspect(showCommands).matched?.commandId).toBe('app.showCommands');
        expect(keybindingManager.inspect(showCommandsF1).matched?.commandId).toBe(
            'app.showCommands'
        );
        expect(keybindingManager.inspect(closeCommands).matched?.commandId).toBe(
            'app.closeCommands'
        );
    });

    it('lets command palette close keybindings work while text inputs or dialogs are active', () => {
        const { keybindingManager, context } = createServices();
        const closeCommands = { key: 'Esc', modifiers: [] };

        context.contextKeys.set(ContextKey.TextInputFocus, true);
        context.contextKeys.set(ContextKey.DialogOpen, true);

        context.contextKeys.set(ContextKey.CommandPaletteOpen, true);

        expect(keybindingManager.inspect(closeCommands).matched?.commandId).toBe(
            'app.closeCommands'
        );
    });

    it('registers window titlebar contributions for titlebar buttons', async () => {
        const { menuService, context, userSettings } = createServices();

        const closeContribution = menuService.getItem(MenuId.TitleBar, 'window.close');
        const alwaysOnTopContribution = menuService.getItem(
            MenuId.TitleBar,
            'window.toggleAlwaysOnTop'
        );

        expect(closeContribution).toBeDefined();
        expect(alwaysOnTopContribution).toBeDefined();
        expect(menuService.getItem(MenuId.CommandPalette, 'window.close')).toBeDefined();
        expect(await menuService.execute(closeContribution!)).toBe(true);
        expect(context.window.close).toHaveBeenCalledOnce();
        expect(await menuService.execute(alwaysOnTopContribution!)).toBe(true);
        expect(getStoreValue(userSettings).base.alwaysOnTop).toBe(true);
        expect(context.window.setAlwaysOnTop).toHaveBeenCalledWith(true);
    });

    it('reflects toggled state for window and theme contributions', async () => {
        const { commandService, menuService, context } = createServices();

        const alwaysOnTopContribution = menuService.getItem(
            MenuId.TitleBar,
            'window.toggleAlwaysOnTop'
        )!;
        const fullscreenContribution = menuService.getItem(
            MenuId.TitleBar,
            'window.toggleFullscreen'
        )!;
        const micaThemeContribution = menuService.getItem(
            MenuId.CommandPalette,
            'theme.effects.mica'
        )!;

        expect(menuService.isToggled(alwaysOnTopContribution)).toBe(false);
        expect(menuService.isToggled(fullscreenContribution)).toBe(false);
        expect(menuService.isToggled(micaThemeContribution)).toBe(false);

        context.contextKeys.set(ContextKey.WindowAlwaysOnTop, true);
        context.contextKeys.set(ContextKey.WindowFullscreen, true);
        context.contextKeys.set(ContextKey.ThemeEffects, 'mica');

        expect(menuService.isToggled(alwaysOnTopContribution)).toBe(true);
        expect(menuService.getDisplayTitle(alwaysOnTopContribution)).toBe('取消置顶');
        expect(menuService.inspect(alwaysOnTopContribution).toggled).toBe(true);
        expect(menuService.isToggled(fullscreenContribution)).toBe(true);
        expect(menuService.getDisplayTitle(fullscreenContribution)).toBe('退出全屏');
        expect(menuService.isToggled(micaThemeContribution)).toBe(true);
    });
});
