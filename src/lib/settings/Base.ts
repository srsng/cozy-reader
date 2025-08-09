import { LogLevel } from '$lib/types';
import type { AppThemeData, AppThemeMode, AppThemeType } from './Theme';
import { DefaultThemeData } from './Theme';

export interface BaseSettings {
	titlebar: boolean;
	header: boolean;
	footer: boolean;
	// dark or light
	themeMode: AppThemeMode;
	// soloution type of theme
	themeType: AppThemeType;
	// data of solotution
	themeData: AppThemeData;
	lang: AppLanuage;
	logLevel: LogLevel;
	zoom: number;
	alwaysOnTop: boolean;
}

export type AppLanuage = 'zh-cn' | 'en';
export const DefaultBaseSettings: BaseSettings = {
	titlebar: true,
	header: true,
	footer: true,
	themeMode: 'system' as AppThemeMode,
	themeType: 'standard',
	themeData: DefaultThemeData,
	lang: 'zh-cn' as AppLanuage,
	logLevel: LogLevel.info,
	zoom: 1,
	alwaysOnTop: false
};
