import { setTheme as setModeWatcherTheme } from 'mode-watcher';
import {
	type AppThemeData,
	type AppThemeType,
	type StdTDName,
	type StandardThemeData,
	type FourColorsThemeData,
	type PonyThemeData,
	type PonyName,
	DefaultThemeData
} from '$lib/settings/Theme';
import type { ThemeBinding } from '$lib/settings/background';
import { updateHue as updateFourColorsHue } from './four_colors';
import { updateName as updateStdName } from './standard';

/**
 * 应用主题类型
 * @param themeType 主题类型
 */
export function applyThemeType(themeType: AppThemeType): void {
	setModeWatcherTheme(themeType);
}

/**
 * 应用 pony 主题的小马名
 * @param name 小马名
 */
export function applyPonyName(name: PonyName): void {
	// todo
	console.log('todo: applyPonyName', name);
}

/**
 * 应用 four_colors 主题的色相值
 * @param hue 色相值 (0-360)
 */
export function applyFourColorsHue(hue: number): void {
	updateFourColorsHue(hue);
}

/**
 * 应用 four_colors 主题名称
 * @param name
 */
export function applyStdName(name: StdTDName): void {
	updateStdName(name);
}

/**
 * 初始化主题
 * @param themeType 主题类型
 * @param themeData 主题数据
 */
export function initializeTheme(themeType: AppThemeType, themeData: AppThemeData): void {
	applyThemeType(themeType);
	applyAllThemeData(themeData);
}

/**
 * 应用所有类型的主题数据
 * @param themeData 主题数据
 */
export function applyAllThemeData(themeData: AppThemeData): void {
	applyFourColorsHue(themeData.four_colors.hue ?? DefaultThemeData.four_colors.hue);
	applyStdName(themeData.standard.name ?? DefaultThemeData.standard.name);
	applyPonyName(themeData.pony.name ?? DefaultThemeData.pony.name);
}

/**
 * 获取主题的默认数据
 * @param themeType 主题类型
 * @returns 默认主题数据
 */
export function getDefaultThemeData<T extends AppThemeType = AppThemeType>(
	themeType: T
): AppThemeData[T] {
	return DefaultThemeData[themeType];
}

/**
 * 创建主题绑定
 * @param themeType 主题类型
 * @param themeData 完整的主题数据
 * @returns 主题绑定对象
 */
export function createThemeBinding<T extends AppThemeType>(
	themeType: T,
	themeData: AppThemeData
): ThemeBinding<T> {
	return {
		type: themeType,
		data: structuredClone(themeData[themeType])
	};
}

/**
 * 验证主题绑定是否有效
 * @param themeBinding 主题绑定对象
 * @returns 是否有效
 */
export function isValidThemeBinding(themeBinding: ThemeBinding<AppThemeType>): boolean {
	if (!themeBinding || !themeBinding.type || !themeBinding.data) {
		return false;
	}

	switch (themeBinding.type) {
		case 'four_colors':
			const fourColorsData = themeBinding.data as FourColorsThemeData;
			return (
				typeof fourColorsData.hue === 'number' &&
				fourColorsData.hue >= 0 &&
				fourColorsData.hue <= 360
			);
		case 'standard':
			const standardData = themeBinding.data as StandardThemeData;
			return typeof standardData.name === 'string' && standardData.name.length > 0;
		case 'pony':
			const ponyData = themeBinding.data as PonyThemeData;
			return typeof ponyData.name === 'string' && ponyData.name.length > 0;
		default:
			return false;
	}
}

/**
 * 检查是否有主题绑定
 * @param obj 可能包含主题绑定的对象
 * @returns 是否有主题绑定
 */
export function hasThemeBinding(obj: { themeBinding?: ThemeBinding<AppThemeType> }): boolean {
	return obj.themeBinding !== undefined && obj.themeBinding !== null;
}

/**
 * 获取主题绑定的显示名称
 * @param themeBinding 主题绑定对象
 * @returns 显示名称
 */
export function getThemeBindingDisplayName(themeBinding: ThemeBinding<AppThemeType>): string {
	switch (themeBinding.type) {
		case 'four_colors':
			const fourColorsData = themeBinding.data as FourColorsThemeData;
			return `四色主题 (色相: ${fourColorsData.hue}°)`;
		case 'standard':
			const standardData = themeBinding.data as StandardThemeData;
			return `标准主题 (${standardData.name})`;
		case 'pony':
			const ponyData = themeBinding.data as PonyThemeData;
			return `小马主题 (${ponyData.name})`;
		default:
			return '未知主题';
	}
}
