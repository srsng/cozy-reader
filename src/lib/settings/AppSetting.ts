import type { BaseSettings, ReaderSettings } from '.';
import { DefaultBaseSettings, DefaultReaderSettings } from '.';

export interface Settings {
	base: BaseSettings;
	reader: ReaderSettings;
}

// 默认配置
export const DEFAULT_SETTINGS: Settings = {
	base: DefaultBaseSettings,
	reader: DefaultReaderSettings
};
