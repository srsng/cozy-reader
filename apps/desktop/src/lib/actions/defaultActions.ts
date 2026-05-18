import * as z from 'zod';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import { ContextKey } from '$lib/context-keys';
import {
    DEFAULT_ZOOM,
    ZOOM_STEP,
    getStoreValue,
    setAlwaysOnTop,
    setZoom,
    toggleFullscreen,
    updateSettings
} from '$lib/commands/commandHelpers';
import { MenuId } from '$lib/menus';
import { ModifierKey } from '$lib/keybindings/types';
import type { AppThemeEffects } from '$lib/settings/Theme';
import type { CommandSpec } from '$lib/commands/types';
import type { BgSettingsTab, SettingsTab } from '$lib/utils/route.svelte';
import type { Disposable } from '$lib/utils/disposable';
import { defineActions, defineKnownAction, type RegisterActionServices } from './types';
import { registerActions } from './actionRegistry';

declare module '$lib/commands/types' {
    interface CommandRegistry {
        'app.showCommands': CommandSpec<[], void>;
        'app.closeCommands': CommandSpec<[], void>;
        'navigate.home': CommandSpec<[], void>;
        'navigate.back': CommandSpec<[], void>;
        'navigate.settings': CommandSpec<[SettingsTab?], void>;
        'navigate.backgroundSettings': CommandSpec<[BgSettingsTab?], void>;
        'zoom.in': CommandSpec<[], void>;
        'zoom.out': CommandSpec<[], void>;
        'zoom.reset': CommandSpec<[], void>;
        'window.toggleAlwaysOnTop': CommandSpec<[], void>;
        'window.toggleFullscreen': CommandSpec<[], void>;
        'window.minimize': CommandSpec<[], void>;
        'window.maximize': CommandSpec<[], void>;
        'window.close': CommandSpec<[], void>;
        'window.refresh': CommandSpec<[], void>;
        'window.toggleDevtools': CommandSpec<[], void>;
        'theme.effects.set': CommandSpec<[AppThemeEffects], void>;
    }
}

const noArgsSchema = z.tuple([]);
const settingsTabSchema = z.enum(['base', 'theme', 'reader']);
const backgroundSettingsTabSchema = z.enum(['golbal', 'overlay', 'custom']);
const settingsNavigationArgsSchema = z
    .union([
        z.tuple([]),
        z.tuple([settingsTabSchema]),
        z.tuple([z.object({ tab: settingsTabSchema.optional() }).optional()])
    ])
    .transform((args): [SettingsTab?] => {
        const payload = args[0];
        if (typeof payload === 'string') return [payload];
        return [payload?.tab];
    }) as StandardSchemaV1<unknown, [SettingsTab?]>;
const backgroundSettingsNavigationArgsSchema = z
    .union([
        z.tuple([]),
        z.tuple([backgroundSettingsTabSchema]),
        z.tuple([z.object({ tab: backgroundSettingsTabSchema.optional() }).optional()])
    ])
    .transform((args): [BgSettingsTab?] => {
        const payload = args[0];
        if (typeof payload === 'string') return [payload];
        return [payload?.tab];
    }) as StandardSchemaV1<unknown, [BgSettingsTab?]>;
const themeEffectSchema = z.enum(['none', 'mica', 'acrylic', 'blur']);
const themeEffectPayloadSchema = z
    .union([themeEffectSchema, z.object({ effect: themeEffectSchema })])
    .transform(
        (payload): AppThemeEffects => (typeof payload === 'string' ? payload : payload.effect)
    );
const themeEffectArgsSchema = z.tuple([themeEffectPayloadSchema]);

export const defaultActions = defineActions([
    defineKnownAction({
        id: 'app.showCommands',
        title: '切换命令面板',
        description: '打开或关闭命令面板',
        category: 'application',
        keywords: ['command', 'palette', '命令面板'],
        command: {
            argsSchema: noArgsSchema,
            run: (context) => {
                context.contextKeys.set(
                    ContextKey.CommandPaletteOpen,
                    !context.contextKeys.get(ContextKey.CommandPaletteOpen)
                );
            }
        },
        keybindings: [
            {
                id: 'app.show-commands',
                combination: { key: 'p', modifiers: [ModifierKey.Ctrl] },
                allowInTextInput: true,
                allowWhenDialogOpen: true,
                allowWhenCommandPaletteOpen: true
            },
            {
                id: 'app.show-commands-f1',
                combination: { key: 'f1', modifiers: [] },
                allowInTextInput: true,
                allowWhenDialogOpen: true,
                allowWhenCommandPaletteOpen: true
            }
        ]
    }),
    defineKnownAction({
        id: 'app.closeCommands',
        title: '关闭命令面板',
        description: '关闭命令面板',
        category: 'application',
        keywords: ['command', 'palette', '命令面板'],
        command: {
            enablement: ContextKey.CommandPaletteOpen,
            argsSchema: noArgsSchema,
            run: (context) => {
                context.contextKeys.set(ContextKey.CommandPaletteOpen, false);
            }
        },
        keybindings: [
            {
                id: 'app.close-commands',
                combination: { key: 'Esc', modifiers: [] },
                allowInTextInput: true,
                allowWhenDialogOpen: true,
                allowWhenCommandPaletteOpen: true
            }
        ]
    }),
    defineKnownAction({
        id: 'navigate.home',
        title: '返回主页',
        description: '导航到主页',
        category: 'navigation',
        keywords: ['home', '主页'],
        command: {
            argsSchema: noArgsSchema,
            run: (context) => {
                context.navigation.home();
            }
        },
        menus: [
            {
                menu: MenuId.CommandPalette,
                order: 90
            },
            {
                menu: MenuId.TitleBar,
                order: 0
            }
        ]
    }),
    defineKnownAction({
        id: 'navigate.back',
        title: '返回上一页',
        description: '返回历史记录中的上一页',
        category: 'navigation',
        keywords: ['back', '返回'],
        command: {
            argsSchema: noArgsSchema,
            canRun: (context) => context.navigation.canGoBack(),
            run: (context) => {
                context.navigation.back();
            }
        },
        menus: [
            {
                menu: MenuId.CommandPalette,
                order: 91
            },
            {
                menu: MenuId.TitleBar,
                order: 99
            }
        ]
    }),
    defineKnownAction({
        id: 'navigate.settings',
        title: '打开设置',
        description: '导航到设置页面',
        category: 'navigation',
        keywords: ['settings', 'preferences', '配置'],
        command: {
            argsSchema: settingsNavigationArgsSchema,
            run: (context, tab?: SettingsTab) => {
                context.navigation.settings(tab);
            }
        },
        menus: [
            {
                menu: MenuId.CommandPalette,
                order: 100,
                defaultShortcut: 'Ctrl+,'
            },
            {
                menu: MenuId.TitleBar,
                order: 1
            }
        ],
        keybindings: [
            {
                combination: { key: ',', modifiers: [ModifierKey.Ctrl] }
            }
        ]
    }),
    defineKnownAction({
        id: 'navigate.backgroundSettings',
        title: '打开背景设置',
        description: '导航到背景设置页面',
        category: 'navigation',
        keywords: ['background', '背景设置'],
        command: {
            argsSchema: backgroundSettingsNavigationArgsSchema,
            run: (context, tab?: BgSettingsTab) => {
                context.navigation.backgroundSettings(tab);
            }
        },
        menus: [
            {
                menu: MenuId.CommandPalette,
                order: 101
            },
            {
                menu: MenuId.TitleBar,
                order: 2
            }
        ]
    }),
    defineKnownAction({
        id: 'zoom.in',
        title: '放大',
        description: '增加应用程序缩放比例',
        category: 'zoom',
        keywords: ['zoom', '放大'],
        command: {
            argsSchema: noArgsSchema,
            run: (context) => {
                const settings = getStoreValue(context.userSettings);
                setZoom(context, settings.base.zoom + ZOOM_STEP);
            }
        },
        menus: [
            {
                menu: MenuId.CommandPalette,
                order: 200,
                defaultShortcut: 'Ctrl+=',
                keepOpen: true
            }
        ],
        keybindings: [
            {
                combination: { key: '=', modifiers: [ModifierKey.Ctrl] },
                allowWhenCommandPaletteOpen: true
            }
        ]
    }),
    defineKnownAction({
        id: 'zoom.out',
        title: '缩小',
        description: '减少应用程序缩放比例',
        category: 'zoom',
        keywords: ['zoom', '缩小'],
        command: {
            argsSchema: noArgsSchema,
            run: (context) => {
                const settings = getStoreValue(context.userSettings);
                setZoom(context, settings.base.zoom - ZOOM_STEP);
            }
        },
        menus: [
            {
                menu: MenuId.CommandPalette,
                order: 201,
                defaultShortcut: 'Ctrl+-',
                keepOpen: true
            }
        ],
        keybindings: [
            {
                combination: { key: '-', modifiers: [ModifierKey.Ctrl] },
                allowWhenCommandPaletteOpen: true
            }
        ]
    }),
    defineKnownAction({
        id: 'zoom.reset',
        title: '重置缩放',
        description: '重置应用程序缩放比例为100%',
        category: 'zoom',
        keywords: ['zoom', '重置'],
        command: {
            argsSchema: noArgsSchema,
            run: (context) => setZoom(context, DEFAULT_ZOOM)
        },
        menus: [
            {
                menu: MenuId.CommandPalette,
                order: 202,
                defaultShortcut: 'Ctrl+0',
                keepOpen: true
            }
        ],
        keybindings: [
            {
                combination: { key: '0', modifiers: [ModifierKey.Ctrl] },
                allowWhenCommandPaletteOpen: true
            }
        ]
    }),
    defineKnownAction({
        id: 'window.toggleAlwaysOnTop',
        title: '切换置顶状态',
        description: '切换窗口始终置顶状态',
        category: 'window',
        keywords: ['always on top', '置顶'],
        command: {
            argsSchema: noArgsSchema,
            run: async (context) => {
                const settings = getStoreValue(context.userSettings);
                await setAlwaysOnTop(context, !settings.base.alwaysOnTop);
            }
        },
        menus: [
            {
                menu: MenuId.CommandPalette,
                order: 301,
                defaultShortcut: 'Ctrl+Shift+T',
                toggled: {
                    when: ContextKey.WindowAlwaysOnTop,
                    title: '取消置顶'
                }
            },
            {
                menu: MenuId.TitleBar,
                order: 10,
                toggled: {
                    when: ContextKey.WindowAlwaysOnTop,
                    title: '取消置顶'
                }
            }
        ],
        keybindings: [
            {
                id: 'window.toggle-always-on-top',
                combination: { key: 't', modifiers: [ModifierKey.Ctrl, ModifierKey.Shift] },
                allowWhenCommandPaletteOpen: true
            }
        ]
    }),
    defineKnownAction({
        id: 'window.toggleFullscreen',
        title: '切换全屏',
        description: '切换全屏模式',
        category: 'window',
        keywords: ['fullscreen', '全屏'],
        command: {
            argsSchema: noArgsSchema,
            run: toggleFullscreen
        },
        menus: [
            {
                menu: MenuId.CommandPalette,
                order: 302,
                defaultShortcut: 'F11',
                toggled: {
                    when: ContextKey.WindowFullscreen,
                    title: '退出全屏'
                }
            },
            {
                menu: MenuId.TitleBar,
                order: 40,
                toggled: {
                    when: ContextKey.WindowFullscreen,
                    title: '退出全屏'
                }
            }
        ],
        keybindings: [
            {
                id: 'app.toggle-fullscreen',
                combination: { key: 'f11', modifiers: [] }
            }
        ]
    }),
    defineKnownAction({
        id: 'window.minimize',
        title: '最小化窗口',
        category: 'window',
        command: {
            argsSchema: noArgsSchema,
            run: (context) => context.window.minimize()
        },
        menus: [
            {
                menu: MenuId.CommandPalette,
                order: 303
            },
            {
                menu: MenuId.TitleBar,
                order: 20
            }
        ]
    }),
    defineKnownAction({
        id: 'window.maximize',
        title: '最大化窗口',
        category: 'window',
        command: {
            argsSchema: noArgsSchema,
            run: async (context) => {
                await context.window.maximize();
                await context.window.saveState();
            }
        },
        menus: [
            {
                menu: MenuId.CommandPalette,
                order: 304
            },
            {
                menu: MenuId.TitleBar,
                order: 30
            }
        ]
    }),
    defineKnownAction({
        id: 'window.close',
        title: '关闭窗口',
        category: 'window',
        command: {
            argsSchema: noArgsSchema,
            run: (context) => context.window.close()
        },
        menus: [
            {
                menu: MenuId.CommandPalette,
                order: 305
            },
            {
                menu: MenuId.TitleBar,
                order: 50
            }
        ]
    }),
    defineKnownAction({
        id: 'window.refresh',
        title: '刷新页面',
        category: 'window',
        command: {
            argsSchema: noArgsSchema,
            run: (context) => context.window.refresh()
        },
        menus: [
            {
                menu: MenuId.CommandPalette,
                order: 306
            },
            {
                menu: MenuId.TitleBar,
                order: 0
            }
        ],
        keybindings: [
            {
                id: 'window.refresh-ctrl-r',
                combination: { key: 'r', modifiers: [ModifierKey.Ctrl] },
                allowInTextInput: true,
                allowWhenDialogOpen: true,
                allowWhenCommandPaletteOpen: true
            },
            {
                id: 'window.refresh-f5',
                combination: { key: 'f5', modifiers: [] },
                allowInTextInput: true,
                allowWhenDialogOpen: true,
                allowWhenCommandPaletteOpen: true
            }
        ]
    }),
    defineKnownAction({
        id: 'window.toggleDevtools',
        title: '打开开发者工具',
        category: 'window',
        command: {
            enablement: ContextKey.WindowDevtoolsAvailable,
            argsSchema: noArgsSchema,
            run: (context) => context.window.toggleDevtools()
        },
        menus: [
            {
                menu: MenuId.CommandPalette,
                when: ContextKey.WindowDevtoolsAvailable,
                order: 309
            }
        ]
    }),
    defineKnownAction({
        id: 'theme.effects.set',
        title: '设置窗口效果',
        description: '切换窗口背景层效果',
        category: 'theme',
        keywords: ['theme', 'effects', '窗口效果'],
        command: {
            argsSchema: themeEffectArgsSchema,
            run: async (context, effect) => {
                await context.theme.setEffect(effect);
                updateSettings(context, (settings) => {
                    settings.theme.effects = effect;
                });
                context.contextKeys.set(ContextKey.ThemeEffects, effect);
            }
        },
        menus: [
            {
                id: 'theme.effects.none',
                menu: MenuId.CommandPalette,
                title: '关闭窗口效果',
                description: '使用标准窗口背景',
                keywords: ['theme', 'effects', 'none', '窗口效果'],
                order: 400,
                toggled: {
                    when: `${ContextKey.ThemeEffects} == "none"`
                },
                payload: 'none'
            },
            {
                id: 'theme.effects.blur',
                menu: MenuId.CommandPalette,
                title: '窗口效果：模糊',
                description: '设置窗口背景层为模糊效果',
                keywords: ['theme', 'effects', 'blur', '窗口效果'],
                order: 401,
                toggled: {
                    when: `${ContextKey.ThemeEffects} == "blur"`
                },
                payload: 'blur'
            },
            {
                id: 'theme.effects.mica',
                menu: MenuId.CommandPalette,
                title: '窗口效果：云母',
                description: '设置窗口背景层为云母效果',
                keywords: ['theme', 'effects', 'mica', '窗口效果'],
                order: 402,
                toggled: {
                    when: `${ContextKey.ThemeEffects} == "mica"`
                },
                payload: 'mica'
            },
            {
                id: 'theme.effects.acrylic',
                menu: MenuId.CommandPalette,
                title: '窗口效果：亚克力',
                description: '设置窗口背景层为亚克力效果',
                keywords: ['theme', 'effects', 'acrylic', '窗口效果'],
                order: 403,
                toggled: {
                    when: `${ContextKey.ThemeEffects} == "acrylic"`
                },
                payload: 'acrylic'
            }
        ]
    })
]);

export function registerDefaultActions(services: RegisterActionServices): Disposable {
    return registerActions(defaultActions, services);
}
