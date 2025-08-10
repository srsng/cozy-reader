import type { BaseSettings, LayoutSettings, ReaderSettings, ThemeSettings } from '.';
import {
	DefaultBaseSettings,
	DefaultLayoutSettings,
	DefaultReaderSettings,
	DefaultThemeSettings
} from '.';

export interface UserSettings {
	base: BaseSettings;
	layout: LayoutSettings;
	theme: ThemeSettings;
	reader: ReaderSettings;
}

// 默认配置
export const DEFAULT_SETTINGS: UserSettings = {
	base: DefaultBaseSettings,
	layout: DefaultLayoutSettings,
	theme: DefaultThemeSettings,
	reader: DefaultReaderSettings
};
