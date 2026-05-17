import { describe, expect, it, vi } from 'vitest';
import { writable, type Writable } from 'svelte/store';
import { LogLevel } from '$lib/types';
import type { UserSettings } from '$lib/settings';
import type { AppState } from '$lib/state/app-state';
import { DEFAULT_APP_STATE } from '$lib/state/app-state';
import type { CommandContext } from './types';
import { CommandService } from './commandService';
import { registerDefaultCommands } from './defaultCommands';
import { ContextKey, ContextKeyService } from '$lib/context-keys';
import { MenuId, MenuService } from '$lib/menus';
import { registerDefaultActions } from '$lib/actions';
import { KeybindingManager } from '$lib/keybindings/keybindingManager';

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

function createContext() {
    const userSettings = writable(createSettings());
    const appState = writable<AppState>(DEFAULT_APP_STATE);
    const context: CommandContext = {
        appState,
        contextKeys: new ContextKeyService(),
        navigation: {
            settings: vi.fn()
        },
        theme: {
            setEffect: vi.fn()
        },
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

    return { context, userSettings };
}

describe('default commands', () => {
    it('executes zoom commands through the command service', async () => {
        const { context, userSettings } = createContext();
        const commandService = new CommandService(context);
        const menuService = new MenuService(commandService, context.contextKeys);
        const keybindingManager = new KeybindingManager();
        registerDefaultActions({ commandService, menuService, keybindingManager });

        await commandService.execute('zoom.in');

        expect(getStoreValue(userSettings).base.zoom).toBe(1.0625);
    });

    it('disposes default command registrations', async () => {
        const { context } = createContext();
        const commandService = new CommandService(context);
        const disposable = registerDefaultCommands(commandService);

        expect(await commandService.execute('window.restoreState')).toBe(true);

        disposable.dispose();

        expect(await commandService.execute('window.restoreState')).toBe(false);
    });

    it('sets theme effects through the command service', async () => {
        const { context, userSettings } = createContext();
        const commandService = new CommandService(context);
        const menuService = new MenuService(commandService, context.contextKeys);
        const keybindingManager = new KeybindingManager();
        registerDefaultActions({ commandService, menuService, keybindingManager });

        await commandService.execute('theme.effects.set', 'blur');

        expect(getStoreValue(userSettings).theme.effects).toBe('blur');
        expect(context.theme.setEffect).toHaveBeenCalledWith('blur');
    });

    it('does not update theme effect settings when the platform command fails', async () => {
        const { context, userSettings } = createContext();
        const commandService = new CommandService(context);
        const menuService = new MenuService(commandService, context.contextKeys);
        const keybindingManager = new KeybindingManager();
        registerDefaultActions({ commandService, menuService, keybindingManager });
        context.contextKeys.set(ContextKey.ThemeEffects, 'none');
        vi.mocked(context.theme.setEffect).mockRejectedValue(new Error('platform failed'));

        await expect(commandService.execute('theme.effects.set', 'blur')).rejects.toThrow(
            'platform failed'
        );

        expect(getStoreValue(userSettings).theme.effects).toBe('none');
        expect(context.contextKeys.get(ContextKey.ThemeEffects)).toBe('none');
    });

    it('rejects parameterized commands without valid payloads', async () => {
        const { context } = createContext();
        const commandService = new CommandService(context);
        registerDefaultCommands(commandService);
        const menuService = new MenuService(commandService, context.contextKeys);
        const keybindingManager = new KeybindingManager();
        registerDefaultActions({ commandService, menuService, keybindingManager });

        expect(commandService.canExecuteInvocation({ commandId: 'theme.effects.set' })).toBe(false);
        expect(await commandService.executeInvocation({ commandId: 'theme.effects.set' })).toBe(
            false
        );
        expect(
            commandService.canExecuteInvocation({
                commandId: 'theme.effects.set',
                payload: 'invalid-effect'
            })
        ).toBe(false);
        expect(
            await commandService.executeInvocation({
                commandId: 'theme.effects.set',
                payload: 'invalid-effect'
            })
        ).toBe(false);
        expect(commandService.canExecuteInvocation({ commandId: 'window.setAlwaysOnTop' })).toBe(
            false
        );
        expect(await commandService.executeInvocation({ commandId: 'window.setAlwaysOnTop' })).toBe(
            false
        );
        expect(
            commandService.canExecuteInvocation({
                commandId: 'window.setAlwaysOnTop',
                payload: 'true'
            })
        ).toBe(false);
        expect(
            await commandService.executeInvocation({
                commandId: 'window.setAlwaysOnTop',
                payload: 'true'
            })
        ).toBe(false);
    });

    it('exposes concrete palette contributions for parameterized commands', async () => {
        const { context, userSettings } = createContext();
        const commandService = new CommandService(context);
        const menuService = new MenuService(commandService, context.contextKeys);
        const keybindingManager = new KeybindingManager();
        registerDefaultActions({ commandService, menuService, keybindingManager });

        const paletteContributions = menuService.getVisibleItems(MenuId.CommandPalette);
        const directThemeCommand = paletteContributions.find(
            (contribution) => contribution.id === 'theme.effects.set'
        );
        const blurThemeContribution = paletteContributions.find(
            (contribution) => contribution.id === 'theme.effects.blur'
        );

        expect(directThemeCommand).toBeUndefined();
        expect(blurThemeContribution).toBeDefined();
        expect(menuService.canExecute(blurThemeContribution!)).toBe(true);
        expect(await menuService.execute(blurThemeContribution!)).toBe(true);
        expect(getStoreValue(userSettings).theme.effects).toBe('blur');
        expect(context.theme.setEffect).toHaveBeenCalledWith('blur');
    });

    it('toggles always-on-top through the command service', async () => {
        const { context, userSettings } = createContext();
        const commandService = new CommandService(context);
        const menuService = new MenuService(commandService, context.contextKeys);
        const keybindingManager = new KeybindingManager();
        registerDefaultActions({ commandService, menuService, keybindingManager });

        await commandService.execute('window.toggleAlwaysOnTop');

        expect(getStoreValue(userSettings).base.alwaysOnTop).toBe(true);
        expect(context.window.setAlwaysOnTop).toHaveBeenCalledWith(true);
    });

    it('does not update always-on-top settings when the window command fails', async () => {
        const { context, userSettings } = createContext();
        const commandService = new CommandService(context);
        registerDefaultCommands(commandService);
        context.contextKeys.set(ContextKey.WindowAlwaysOnTop, false);
        vi.mocked(context.window.setAlwaysOnTop).mockRejectedValue(new Error('platform failed'));

        await expect(commandService.execute('window.setAlwaysOnTop', true)).rejects.toThrow(
            'platform failed'
        );

        expect(getStoreValue(userSettings).base.alwaysOnTop).toBe(false);
        expect(context.contextKeys.get(ContextKey.WindowAlwaysOnTop)).toBe(false);
    });

    it('keeps command palette toggle executable while the palette is open', () => {
        const { context } = createContext();
        const commandService = new CommandService(context);
        const menuService = new MenuService(commandService, context.contextKeys);
        const keybindingManager = new KeybindingManager();
        registerDefaultActions({ commandService, menuService, keybindingManager });

        context.contextKeys.set(ContextKey.CommandPaletteOpen, true);

        expect(commandService.canExecute('app.showCommands')).toBe(true);
        expect(commandService.canExecute('app.closeCommands')).toBe(true);
    });

    it('requires the DevTools runtime capability for the DevTools command', async () => {
        const { context } = createContext();
        const commandService = new CommandService(context);
        const menuService = new MenuService(commandService, context.contextKeys);
        const keybindingManager = new KeybindingManager();
        registerDefaultActions({ commandService, menuService, keybindingManager });

        context.contextKeys.set(ContextKey.WindowDevtoolsAvailable, false);
        expect(commandService.canExecute('window.toggleDevtools')).toBe(false);
        expect(await commandService.execute('window.toggleDevtools')).toBe(false);
        expect(
            menuService
                .getVisibleItems(MenuId.CommandPalette)
                .some((contribution) => contribution.id === 'window.toggleDevtools')
        ).toBe(false);

        context.contextKeys.set(ContextKey.WindowDevtoolsAvailable, true);
        expect(commandService.canExecute('window.toggleDevtools')).toBe(true);
        expect(
            menuService
                .getVisibleItems(MenuId.CommandPalette)
                .some((contribution) => contribution.id === 'window.toggleDevtools')
        ).toBe(true);
    });
});
