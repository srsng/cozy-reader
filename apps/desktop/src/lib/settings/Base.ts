import { LogLevel } from '$lib/types';
import { DEFAULT_OPACITY } from './background';

export interface BaseSettings {
	langCode: AppLanguageCode;
	logLevel: LogLevel;
	zoom: number;
	alwaysOnTop: boolean;
	uiOpacity: number; // UI整体透明度 (0-1)
	bodyTransparent: boolean; // 窗口背景层透明
	layoutControlsOutline: boolean; // titlebar等布局层控件外框
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
	uiOpacity: DEFAULT_OPACITY,
	bodyTransparent: false,
	layoutControlsOutline: true
};
