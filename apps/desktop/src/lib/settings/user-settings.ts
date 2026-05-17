import { DefaultBaseSettings, type BaseSettings } from './Base';
import { DefaultLayoutSettings, type LayoutSettings } from './Layout';
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

export function mergeUserSettingsWithDefaults(savedConfig?: Partial<UserSettings> | null): UserSettings {
    return {
        ...DEFAULT_SETTINGS,
        ...savedConfig,
        background: {
            ...DEFAULT_SETTINGS.background,
            ...savedConfig?.background,
            global: {
                ...DEFAULT_SETTINGS.background.global,
                ...savedConfig?.background?.global
            }
        },
        keybindings: {
            ...DEFAULT_SETTINGS.keybindings,
            ...savedConfig?.keybindings,
            rules: Array.isArray(savedConfig?.keybindings?.rules)
                ? savedConfig.keybindings.rules
                : DEFAULT_SETTINGS.keybindings.rules
        }
    };
}
