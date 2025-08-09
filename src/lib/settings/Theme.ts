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
