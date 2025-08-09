import { LogLevel } from '$lib/types';

export interface BaseSettings {
	titlebar: boolean;
	header: boolean;
	footer: boolean;
	langCode: AppLanguageCode;
	logLevel: LogLevel;
	zoom: number;
	alwaysOnTop: boolean;
}

export type AppLanguageCode = 'zh-cn' | 'en';

export const langCode2Name: Record<AppLanguageCode, string> = {
	'zh-cn': '简体中文',
	en: 'English'
};

export const DefaultBaseSettings: BaseSettings = {
	titlebar: true,
	header: true,
	footer: true,
	langCode: 'zh-cn' as AppLanguageCode,
	logLevel: LogLevel.info,
	zoom: 1,
	alwaysOnTop: false
};
