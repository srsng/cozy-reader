export { type BaseSettings, DefaultBaseSettings } from './Base';
export { type ThemeSettings, DefaultThemeSettings } from './Theme';
export { type LayoutSettings, DefaultLayoutSettings } from './Layout';
export { type ReaderSettings, DefaultReaderSettings } from './Reader';
export { type BackgroundSettings, DefaultGlobalBackgroundConfig } from './background';
export { type KeybindingSettings, DefaultKeybindingSettings } from './Keybindings';

export {
    appLanguageCodeFromSystemLocale,
    createDefaultUserSettings,
    type UserSettings,
    DEFAULT_SETTINGS,
    mergeUserSettingsWithDefaults
} from './user-settings';
export * from '$lib/settings-registry';
