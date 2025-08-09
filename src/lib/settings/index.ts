export { type BaseSettings, DefaultBaseSettings } from './Base';
export { type ThemeSettings, DefaultThemeSettings } from './Theme';
export { type ReaderSettings, DefaultReaderSettings } from './Reader';

export { type Settings, DEFAULT_SETTINGS } from './AppSetting';

export const SETTINGS_KEY = 'app-settings';
// app context Key
export const SETTINGS = Symbol(SETTINGS_KEY);
