import { LogLevel } from '$lib/types';

export interface BaseSettingConfig {
	theme: appTheme;
	language: appLanuage;
	logLevel: LogLevel;
	zoom: number;
}

export type appTheme = 'light' | 'dark';
export type appLanuage = 'zh' | 'en';

export const DefaultBaseSettingConfig: BaseSettingConfig = {
	theme: 'light' as appTheme,
	language: 'zh' as appLanuage,
	logLevel: LogLevel.info,
	zoom: 1
};
