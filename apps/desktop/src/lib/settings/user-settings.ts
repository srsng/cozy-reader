import { DefaultBaseSettings, SUPPORTED_LANG, type AppLanguageCode, type BaseSettings } from './Base';
import { DefaultLayoutSettings, migrateTitleBarConfig, type LayoutSettings } from './Layout';
import { DefaultReaderSettings, type ReaderSettings } from './Reader';
import { DefaultThemeSettings, type ThemeSettings } from './Theme';
import { DefaultBackgroundSettings, type BackgroundSettings } from './background';
import { DefaultKeybindingSettings, type KeybindingSettings } from './Keybindings';

export interface UserSettings {
    base: BaseSettings;
    layout: LayoutSettings;
    theme: ThemeSettings;
    reader: ReaderSettings;
    background: BackgroundSettings;
    keybindings: KeybindingSettings;
}

// 默认配置
export const DEFAULT_SETTINGS: UserSettings = {
    base: DefaultBaseSettings,
    layout: DefaultLayoutSettings,
    theme: DefaultThemeSettings,
    reader: DefaultReaderSettings,
    background: DefaultBackgroundSettings,
    keybindings: DefaultKeybindingSettings
};

export function createDefaultUserSettings(langCode = DefaultBaseSettings.langCode): UserSettings {
    return {
        ...structuredClone(DEFAULT_SETTINGS),
        base: {
            ...DEFAULT_SETTINGS.base,
            langCode: normalizeAppLanguageCode(langCode)
        }
    };
}

export function mergeUserSettingsWithDefaults(
    savedConfig?: Partial<UserSettings> | null,
    defaultSettings: UserSettings = DEFAULT_SETTINGS
): UserSettings {
    return {
        ...defaultSettings,
        ...savedConfig,
        layout: {
            ...defaultSettings.layout,
            ...savedConfig?.layout,
            layoutConfigs: {
                ...defaultSettings.layout.layoutConfigs,
                ...savedConfig?.layout?.layoutConfigs,
                titlebar: migrateTitleBarConfig(savedConfig?.layout?.layoutConfigs?.titlebar)
            }
        },
        background: {
            ...defaultSettings.background,
            ...savedConfig?.background,
            global: {
                ...defaultSettings.background.global,
                ...savedConfig?.background?.global
            }
        },
        keybindings: {
            ...defaultSettings.keybindings,
            ...savedConfig?.keybindings,
            rules: Array.isArray(savedConfig?.keybindings?.rules)
                ? savedConfig.keybindings.rules
                : defaultSettings.keybindings.rules
        }
    };
}

export function appLanguageCodeFromSystemLocale(locale: string | null): AppLanguageCode {
    if (!locale) return DefaultBaseSettings.langCode;

    const normalizedLocale = locale.toLowerCase();
    // todo: 规范化语言代码
    // todo2: 把 zh-cn 重构成 zh-CN
    if (normalizedLocale.startsWith('zh')) return 'zh-cn';
    if (normalizedLocale.startsWith('en')) return 'en';

    return DefaultBaseSettings.langCode;
}

function normalizeAppLanguageCode(langCode: string): AppLanguageCode {
    return SUPPORTED_LANG.includes(langCode as AppLanguageCode)
        ? (langCode as AppLanguageCode)
        : DefaultBaseSettings.langCode;
}
