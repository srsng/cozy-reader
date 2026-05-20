import { vi } from 'vitest';
import { writable, type Writable } from 'svelte/store';
import { CommandRouter } from '$lib/commands/commandRouter';
import { CommandService } from '$lib/commands/commandService';
import type { CommandContext } from '$lib/commands/types';
import { ContextKey, ContextKeyService, type ContextKeySnapshot } from '$lib/context-keys';
import { KeybindingManager } from '$lib/keybindings/keybindingManager';
import { MenuService } from '$lib/menus';
import type { UserSettings } from '$lib/settings/user-settings';
import { createDefaultAppState, type AppState } from '$lib/state/app-state';
import {
    setAppCommandPaletteOpen,
    setAppDialogOpen,
    setAppTextInputFocus,
    setAppThemeEffectAvailabilityForTest,
    setAppWindowDevtoolsAvailable,
    setAppWindowFullscreen
} from '$lib/stores/appState';
import { registerAppContextProjection } from '$lib/state/contextSnapshot';
import { LogLevel } from '$lib/types';

export type DeepPartial<T> = {
    [Key in keyof T]?: T[Key] extends object ? DeepPartial<T[Key]> : T[Key];
};

export type TestCommandContextOptions = {
    settings?: DeepPartial<UserSettings>;
    appState?: AppState;
    contextKeys?: ContextKeySnapshot;
    projectAppContext?: boolean;
};

export type AppCommandHarnessOptions = TestCommandContextOptions & {
    registerCommandExecutor?: boolean;
};

const TEST_DEFAULT_SETTINGS: UserSettings = {
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

export function createTestSettings(overrides: DeepPartial<UserSettings> = {}): UserSettings {
    return mergeDeep(structuredClone(TEST_DEFAULT_SETTINGS), overrides);
}

export function createTestCommandContext(options: TestCommandContextOptions = {}) {
    const initialUserSettings = createTestSettings(options.settings);
    const initialAppState = options.appState ?? createDefaultAppState();
    const initialContextKeys =
        options.projectAppContext === true
            ? applyProjectedContextOverrides(
                  options.contextKeys ?? {},
                  initialAppState,
                  initialUserSettings
              )
            : (options.contextKeys ?? {});
    const userSettings = writable(initialUserSettings);
    const appState = writable<AppState>(initialAppState);
    const contextKeys = new ContextKeyService(initialContextKeys);
    if (options.projectAppContext === true) {
        registerAppContextProjection(contextKeys, appState, userSettings);
    }
    const context: CommandContext = {
        appState,
        contextKeys,
        navigation: {
            back: vi.fn(),
            backgroundSettings: vi.fn(),
            canGoBack: vi.fn(() => true),
            home: vi.fn(),
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

    return { context, userSettings, appState };
}

export function createAppCommandHarness(options: AppCommandHarnessOptions = {}) {
    const { context, userSettings, appState } = createTestCommandContext({
        ...options,
        projectAppContext: true
    });
    const commandService = new CommandService(context);
    const commandRouter = new CommandRouter();
    commandRouter.registerScope('app', commandService);
    const menuService = new MenuService(commandRouter, context.contextKeys);
    const keybindingManager = new KeybindingManager();
    keybindingManager.setContextKeyService(context.contextKeys);
    keybindingManager.setTextInputFocusUpdater((focused) => {
        setAppTextInputFocus(appState, focused);
    });

    if (options.registerCommandExecutor ?? true) {
        keybindingManager.setCommandExecutor(commandRouter);
    }

    return {
        appState,
        commandRouter,
        commandService,
        context,
        keybindingManager,
        menuService,
        userSettings
    };
}

export function getStoreValue<T>(store: Writable<T>): T {
    let value: T | undefined;
    const unsubscribe = store.subscribe((currentValue) => {
        value = currentValue;
    });
    unsubscribe();
    return value as T;
}

export function updateAppState(
    appState: Writable<AppState>,
    mutator: (draft: AppState) => void
): void {
    appState.update((currentValue) => {
        const nextValue = structuredClone(currentValue);
        mutator(nextValue);
        return nextValue;
    });
}

export function setAppContextState(
    appState: Writable<AppState>,
    key: ContextKey,
    value: ContextKeySnapshot[string]
): void {
    switch (key) {
        case ContextKey.CommandPaletteOpen:
            setAppCommandPaletteOpen(appState, Boolean(value));
            return;
        case ContextKey.DialogOpen:
            setAppDialogOpen(appState, Boolean(value));
            return;
        case ContextKey.TextInputFocus:
            setAppTextInputFocus(appState, Boolean(value));
            return;
        case ContextKey.WindowDevtoolsAvailable:
            setAppWindowDevtoolsAvailable(appState, Boolean(value));
            return;
        case ContextKey.WindowFullscreen:
            setAppWindowFullscreen(appState, Boolean(value));
            return;
        case ContextKey.ThemeEffectBlurAvailable:
            setAppThemeEffectAvailabilityForTest(appState, {
                ...getStoreValue(appState).theme.effectAvailability,
                blur: Boolean(value)
            });
            return;
        case ContextKey.ThemeEffectMicaAvailable:
            setAppThemeEffectAvailabilityForTest(appState, {
                ...getStoreValue(appState).theme.effectAvailability,
                mica: Boolean(value)
            });
            return;
        case ContextKey.ThemeEffectAcrylicAvailable:
            setAppThemeEffectAvailabilityForTest(appState, {
                ...getStoreValue(appState).theme.effectAvailability,
                acrylic: Boolean(value)
            });
            return;
        case ContextKey.IsWindows:
            if (value === true) {
                updateAppState(appState, (state) => {
                    state.platform.type = 'windows';
                });
            }
            return;
        case ContextKey.IsMac:
            if (value === true) {
                updateAppState(appState, (state) => {
                    state.platform.type = 'macos';
                });
            }
            return;
        case ContextKey.IsLinux:
            if (value === true) {
                updateAppState(appState, (state) => {
                    state.platform.type = 'linux';
                });
            }
            return;
        case ContextKey.IsAndroid:
            if (value === true) {
                updateAppState(appState, (state) => {
                    state.platform.type = 'android';
                });
            }
            return;
        case ContextKey.IsIOS:
            if (value === true) {
                updateAppState(appState, (state) => {
                    state.platform.type = 'ios';
                });
            }
            return;
        case ContextKey.IsMobile:
            if (value === true) {
                updateAppState(appState, (state) => {
                    state.platform.type = 'android';
                });
            }
            return;
        case ContextKey.IsDesktop:
            if (value === true) {
                updateAppState(appState, (state) => {
                    state.platform.type = 'windows';
                });
            }
            return;
        case ContextKey.PlatformType:
            if (typeof value === 'string') {
                updateAppState(appState, (state) => {
                    state.platform.type = value as AppState['platform']['type'];
                });
            }
            return;
        case ContextKey.PlatformName:
            if (typeof value === 'string') {
                updateAppState(appState, (state) => {
                    state.platform.name = value as AppState['platform']['name'];
                });
            }
            return;
        case ContextKey.PlatformVersion:
            if (typeof value === 'string') {
                updateAppState(appState, (state) => {
                    state.platform.version = value;
                });
            }
            return;
    }
}

export function setSettingsContextState(
    userSettings: Writable<UserSettings>,
    key: ContextKey,
    value: ContextKeySnapshot[string]
): void {
    userSettings.update((settings) => {
        const nextSettings = structuredClone(settings);

        switch (key) {
            case ContextKey.ThemeEffects:
                if (isThemeEffect(value)) {
                    nextSettings.theme.effects = value;
                }
                break;
            case ContextKey.WindowAlwaysOnTop:
                nextSettings.base.alwaysOnTop = Boolean(value);
                break;
        }

        return nextSettings;
    });
}

function mergeDeep<T>(base: T, overrides: DeepPartial<T>): T {
    if (!isPlainObject(base) || !isPlainObject(overrides)) {
        return (overrides === undefined ? base : overrides) as T;
    }

    for (const [key, value] of Object.entries(overrides)) {
        if (value === undefined) continue;
        const baseValue = (base as Record<string, unknown>)[key];
        (base as Record<string, unknown>)[key] =
            isPlainObject(baseValue) && isPlainObject(value) ? mergeDeep(baseValue, value) : value;
    }

    return base;
}

function applyProjectedContextOverrides(
    contextKeys: ContextKeySnapshot,
    appState: AppState,
    userSettings: UserSettings
): ContextKeySnapshot {
    const remainingContextKeys = { ...contextKeys };

    for (const [key, value] of Object.entries(contextKeys)) {
        switch (key) {
            case ContextKey.CommandPaletteOpen:
                appState.ui.commandPaletteOpen = Boolean(value);
                delete remainingContextKeys[key];
                break;
            case ContextKey.DialogOpen:
                appState.ui.dialogOpen = Boolean(value);
                delete remainingContextKeys[key];
                break;
            case ContextKey.TextInputFocus:
                appState.ui.textInputFocus = Boolean(value);
                delete remainingContextKeys[key];
                break;
            case ContextKey.ThemeEffects:
                if (isThemeEffect(value)) {
                    userSettings.theme.effects = value;
                }
                delete remainingContextKeys[key];
                break;
            case ContextKey.WindowAlwaysOnTop:
                userSettings.base.alwaysOnTop = Boolean(value);
                delete remainingContextKeys[key];
                break;
            case ContextKey.WindowDevtoolsAvailable:
                appState.window.devtoolsAvailable = Boolean(value);
                delete remainingContextKeys[key];
                break;
            case ContextKey.WindowFullscreen:
                appState.window.fullscreen = Boolean(value);
                delete remainingContextKeys[key];
                break;
            case ContextKey.ThemeEffectBlurAvailable:
                appState.theme.effectAvailability.blur = Boolean(value);
                delete remainingContextKeys[key];
                break;
            case ContextKey.ThemeEffectMicaAvailable:
                appState.theme.effectAvailability.mica = Boolean(value);
                delete remainingContextKeys[key];
                break;
            case ContextKey.ThemeEffectAcrylicAvailable:
                appState.theme.effectAvailability.acrylic = Boolean(value);
                delete remainingContextKeys[key];
                break;
            case ContextKey.IsWindows:
                if (value === true) appState.platform.type = 'windows';
                delete remainingContextKeys[key];
                break;
            case ContextKey.IsMac:
                if (value === true) appState.platform.type = 'macos';
                delete remainingContextKeys[key];
                break;
            case ContextKey.IsLinux:
                if (value === true) appState.platform.type = 'linux';
                delete remainingContextKeys[key];
                break;
            case ContextKey.IsAndroid:
                if (value === true) appState.platform.type = 'android';
                delete remainingContextKeys[key];
                break;
            case ContextKey.IsIOS:
                if (value === true) appState.platform.type = 'ios';
                delete remainingContextKeys[key];
                break;
            case ContextKey.IsMobile:
                if (value === true) appState.platform.type = 'android';
                delete remainingContextKeys[key];
                break;
            case ContextKey.IsDesktop:
                if (value === true) appState.platform.type = 'windows';
                delete remainingContextKeys[key];
                break;
            case ContextKey.PlatformType:
                if (typeof value === 'string') {
                    appState.platform.type = value as AppState['platform']['type'];
                }
                delete remainingContextKeys[key];
                break;
            case ContextKey.PlatformName:
                if (typeof value === 'string') {
                    appState.platform.name = value as AppState['platform']['name'];
                }
                delete remainingContextKeys[key];
                break;
            case ContextKey.PlatformVersion:
                if (typeof value === 'string') {
                    appState.platform.version = value;
                }
                delete remainingContextKeys[key];
                break;
        }
    }

    return remainingContextKeys;
}

function isThemeEffect(value: unknown): value is UserSettings['theme']['effects'] {
    return value === 'none' || value === 'mica' || value === 'acrylic' || value === 'blur';
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
