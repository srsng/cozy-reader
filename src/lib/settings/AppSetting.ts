import type { BaseSettings, ReaderSettings, ThemeSettings } from '.';
import { DefaultBaseSettings, DefaultReaderSettings, DefaultThemeSettings } from '.';

export interface Settings {
	base: BaseSettings;
	theme: ThemeSettings;
	reader: ReaderSettings;
}

// 默认配置
export const DEFAULT_SETTINGS: Settings = {
	base: DefaultBaseSettings,
	theme: DefaultThemeSettings,
	reader: DefaultReaderSettings
};
