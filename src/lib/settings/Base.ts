import { LogLevel } from '$lib/types';

export interface BaseSettings {
	langCode: AppLanguageCode;
	logLevel: LogLevel;
	zoom: number;
	alwaysOnTop: boolean;
	uiOpacity: number; // UI整体透明度 (0-1)
}

export type AppLanguageCode = 'zh-cn' | 'en';

export const langCode2Name: Record<AppLanguageCode, string> = {
	'zh-cn': '简体中文',
	en: 'English'
};

export const DefaultBaseSettings: BaseSettings = {
	langCode: 'zh-cn' as AppLanguageCode,
	logLevel: LogLevel.info,
	zoom: 1,
	alwaysOnTop: false,
	uiOpacity: 1 // 默认完全不透明
};
