import { Effect } from '@tauri-apps/api/window';

export type AppThemeMode = 'light' | 'dark' | 'system';
export type AppThemeType = 'standard' | 'four_colors' | 'pony';
export type AppThemeEffects = 'none' | 'mica' | 'acrylic' | 'blur';

export const toEffects = {
    mica: [Effect.Mica],
    acrylic: [Effect.Acrylic],
    blur: [Effect.Blur],
    none: []
};
// export interface ThemeDataMap {
// 	standard: StandardThemeData;
// 	four_colors: FourColorsThemeData;
// 	pony: PonyThemeData;
// }

// export type AppThemeData = Record<AppThemeType, ThemeDataMap[AppThemeType]>;
// 每一种type都单独保留data
export type AppThemeData = {
    [T in AppThemeType]: T extends 'standard'
        ? StandardThemeData
        : T extends 'four_colors'
          ? FourColorsThemeData
          : PonyThemeData;
};

export type SomeThemeData = StandardThemeData | FourColorsThemeData | PonyThemeData;

enum StdTDNameEnum {
    black = 'black',
    orange = 'orange',
    violet = 'violet'
}

// 从 enum 生成 union type
export type StdTDName = `${StdTDNameEnum}`;
export const ALL_Std_TD_NAMES = Object.values(StdTDNameEnum);

export enum PonyNameEnum {
    TwilightSparkle = 'ts',
    Fluttershy = 'fs',
    Applejack = 'aj',
    RainbowDash = 'rd',
    PinkiePie = 'pp',
    Rarity = 'rr',
    StarlightGlimmer = 'sg',
    SunsetShimmer = 'ss'
}
// 从 enum 生成 union type
export type PonyName = `${PonyNameEnum}`;
export const ALL_Pony_NAMES = Object.values(PonyNameEnum);

export const Std_TD_NAMES_2_Str: Record<StdTDName, string> = (() => {
    let temp: any = {};
    for (let name in ALL_Std_TD_NAMES) {
        temp[name] = name;
    }
    return temp;
})();

export interface StandardThemeData {
    name: StdTDName;
}

export interface FourColorsThemeData {
    hue: number;
}

export interface PonyThemeData {
    name: PonyName;
}

export const DefaultThemeData: AppThemeData = {
    standard: { name: 'black' },
    four_colors: { hue: 36 },
    pony: { name: 'sg' }
};

export const AppThemeMode2Str: Record<AppThemeMode, string> = {
    light: '浅色',
    dark: '深色',
    system: '跟随系统'
};

export const AppThemeType2Str: Record<AppThemeType, string> = {
    standard: '标准主题',
    four_colors: '四色',
    pony: '友谊是魔法'
};

export type ThemeSettings = {
    // dark or light
    mode: AppThemeMode;
    // soloution type of theme
    type: AppThemeType;
    // data of solotution
    data: AppThemeData;
    // window effects
    effects: AppThemeEffects;
};

export const DefaultThemeSettings: ThemeSettings = {
    mode: 'system' as AppThemeMode,
    type: 'standard',
    data: DefaultThemeData,
    effects: 'none'
};
