import type {
    BackgroundSettings,
    BaseSettings,
    LayoutSettings,
    ReaderSettings,
    ThemeSettings
} from '.';

import {
    DefaultBaseSettings,
    DefaultLayoutSettings,
    DefaultReaderSettings,
    DefaultThemeSettings
} from '.';

import { DefaultBackgroundSettings } from './background';

export interface UserSettings {
    base: BaseSettings;
    layout: LayoutSettings;
    theme: ThemeSettings;
    reader: ReaderSettings;
    background: BackgroundSettings;
}

// 默认配置
export const DEFAULT_SETTINGS: UserSettings = {
    base: DefaultBaseSettings,
    layout: DefaultLayoutSettings,
    theme: DefaultThemeSettings,
    reader: DefaultReaderSettings,
    background: DefaultBackgroundSettings
};
