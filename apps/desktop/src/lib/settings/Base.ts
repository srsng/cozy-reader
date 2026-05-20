import { LogLevel } from '$lib/types';
import { DEFAULT_OPACITY } from './background';

export interface BaseSettings {
    langCode: AppLanguageCode;
    logLevel: LogLevel;
    zoom: number;
    alwaysOnTop: boolean;
    uiOpacity: number; // UI整体不透明度 (0-1)
    bodyTransparent: number; // 窗口背景层不透明度 (0-1)
    layoutControlsOutline: boolean; // titlebar等布局层控件外框
}

// todo: 改成 BCP-47 Code 规范
export type AppLanguageCode = 'zh-cn' | 'en';

export const langCode2Name: Record<AppLanguageCode, string> = {
    'zh-cn': '简体中文',
    en: 'English'
};

export const SUPPORTED_LANG = Object.keys(langCode2Name) as AppLanguageCode[];

export const DefaultBaseSettings: BaseSettings = {
    langCode: 'en' as AppLanguageCode,
    logLevel: LogLevel.info,
    zoom: 1,
    alwaysOnTop: false,
    uiOpacity: DEFAULT_OPACITY,
    bodyTransparent: 1,
    layoutControlsOutline: true
};
