import { LogLevel } from '$lib/types';

export interface BaseSettings {
	titlebar: boolean;
	header: boolean;
	footer: boolean;
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
	lang: 'zh-cn' as AppLanuage,
	logLevel: LogLevel.info,
	zoom: 1,
	alwaysOnTop: false
};
