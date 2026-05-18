import { vi } from 'vitest';
import { writable, type Writable } from 'svelte/store';
import { CommandRouter } from '$lib/commands/commandRouter';
import { CommandService } from '$lib/commands/commandService';
import type { CommandContext } from '$lib/commands/types';
import { ContextKeyService } from '$lib/context-keys';
import { KeybindingManager } from '$lib/keybindings/keybindingManager';
import { MenuService } from '$lib/menus';
import type { UserSettings } from '$lib/settings/user-settings';
import { DEFAULT_APP_STATE, type AppState } from '$lib/state/app-state';
import { LogLevel } from '$lib/types';

export type DeepPartial<T> = {
    [Key in keyof T]?: T[Key] extends object ? DeepPartial<T[Key]> : T[Key];
};

export type TestCommandContextOptions = {
    settings?: DeepPartial<UserSettings>;
    appState?: AppState;
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
    const userSettings = writable(createTestSettings(options.settings));
    const appState = writable<AppState>(options.appState ?? structuredClone(DEFAULT_APP_STATE));
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
    const { context, userSettings, appState } = createTestCommandContext(options);
    const commandService = new CommandService(context);
    const commandRouter = new CommandRouter();
    commandRouter.registerScope('app', commandService);
    const menuService = new MenuService(commandRouter, context.contextKeys);
    const keybindingManager = new KeybindingManager();
    keybindingManager.setContextKeyService(context.contextKeys);

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

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
