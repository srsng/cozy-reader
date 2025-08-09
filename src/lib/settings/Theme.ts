// 每一种type都单独保留data
export type AppThemeData = {
	[T in AppThemeType]: T extends 'standard'
		? StandardThemeData
		: T extends 'four_colors'
			? FourColorsThemeData
			: never;
};

// todo
interface StandardThemeData {}

interface FourColorsThemeData {
	hue: number;
}

export const DefaultThemeData: AppThemeData = {
	// todo
	standard: {},
	four_colors: { hue: 36 }
};

export type AppThemeMode = 'light' | 'dark' | 'system';
export type AppThemeType = 'standard' | 'four_colors';

export const AppThemeMode2Str: Record<AppThemeMode, string> = {
	light: '浅色|light',
	dark: '深色|dark',
	system: '跟随系统'
};

export const AppThemeType2Str: Record<AppThemeType, string> = {
	standard: '标准颜色主题',
	four_colors: '四色颜色主题(拓展版)'
};

export type ThemeSettings = {
	// dark or light
	mode: AppThemeMode;
	// soloution type of theme
	type: AppThemeType;
	// data of solotution
	data: AppThemeData;
};

export const DefaultThemeSettings: ThemeSettings = {
	mode: 'system' as AppThemeMode,
	type: 'standard',
	data: DefaultThemeData
};
