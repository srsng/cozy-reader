import { setTheme as setModeWatcherTheme } from 'mode-watcher';
import type { AppThemeType } from '$lib/settings/Theme';
import { updateHue } from './four_colors';

/**
 * 应用主题类型
 * @param themeType 主题类型
 */
export function applyTheme(themeType: AppThemeType): void {
	setModeWatcherTheme(themeType);
	// console.log(`主题已切换到: ${themeType}`);
}

/**
 * 应用 four_colors 主题的色相值
 * @param hue 色相值 (0-360)
 */
export function applyFourColorsHue(hue: number): void {
	updateHue(hue);
}

/**
 * 初始化主题
 * @param themeType 主题类型
 * @param hue 如果是 four_colors 主题的色相值
 */
export function initializeTheme(themeType: AppThemeType, hue?: number): void {
	applyTheme(themeType);

	if (themeType === 'four_colors') {
		applyFourColorsHue(hue ?? 36);
	}
}
