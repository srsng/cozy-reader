<script lang="ts" module>
	import type {
		BackgroundImage,
		GlobalBackgroundConfig,
		BackgroundFilters
	} from '$lib/settings/background';
	import { getImageFullConfig } from '$lib/settings/background';
	import { convertFileSrc } from '@tauri-apps/api/core';

	// 图片 URL 转换
	export function convertToTauriUrl(filePath: string): string {
		if (!filePath) return '';
		return convertFileSrc(filePath);
	}

	// 验证图片文件格式
	export function isValidImageFormat(fileName: string): boolean {
		const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];
		const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
		return validExtensions.includes(extension);
	}

	// 验证文件大小（字节）
	export function isValidFileSize(fileSize: number, maxSizeMB: number = 10): boolean {
		const maxSizeBytes = maxSizeMB * 1024 * 1024;
		return fileSize <= maxSizeBytes;
	}

	// 生成背景样式对象
	export function generateBackgroundStyles(
		image: BackgroundImage | null,
		globalConfig: GlobalBackgroundConfig
	): Record<string, string> {
		if (!image) {
			return {
				'--settings-bg-image': 'none',
				'--settings-bg-opacity': '0',
				'--settings-bg-size': 'cover',
				'--settings-bg-position': 'center',
				'--settings-bg-blend-mode': 'normal',
				'--settings-bg-filters': 'none',
				'--settings-bg-background-overlay-enabled': 'none',
				'--settings-bg-background-overlay-color': 'transparent',
				'--settings-bg-background-overlay-opacity': '0',
				'--settings-bg-top-overlay-enabled': globalConfig.topOverlay.enabled ? 'block' : 'none',
				'--settings-bg-top-overlay-color': globalConfig.topOverlay.color,
				'--settings-bg-top-overlay-opacity': globalConfig.topOverlay.opacity.toString(),
				'--settings-bg-top-overlay-filters': generateFiltersString(globalConfig.topOverlay.filters)
			};
		}

		const imageUrl = convertToTauriUrl(image.filePath);

		// 使用getImageFullConfig获取完整配置
		const config = getImageFullConfig(image, globalConfig);
		const {
			opacity,
			displayMode,
			position,
			blendMode,
			filters,
			scale,
			rotation,
			offsetX,
			offsetY
		} = config;

		// 转换显示模式为 CSS background-size 值
		const backgroundSize = convertDisplayModeToCSS(displayMode);

		// 转换位置为 CSS background-position 值
		const backgroundPosition = convertPositionToCSS(position);

		// 生成滤镜字符串
		const filtersString = generateFiltersString(filters);
		const backgroundOverlayFiltersString = generateFiltersString(
			globalConfig.backgroundOverlay.filters
		);
		const topOverlayFiltersString = generateFiltersString(globalConfig.topOverlay.filters);

		return {
			'--settings-bg-image': `url("${imageUrl}")`,
			'--settings-bg-opacity': opacity.toString(),
			'--settings-bg-size': backgroundSize,
			'--settings-bg-position': backgroundPosition,
			'--settings-bg-blend-mode': blendMode,
			'--settings-bg-filters': filtersString,
			'--settings-bg-scale': scale.toString(),
			'--settings-bg-rotation': `${rotation}deg`,
			'--settings-bg-offset-x': `${offsetX}px`,
			'--settings-bg-offset-y': `${offsetY}px`,
			'--settings-bg-background-overlay-enabled': globalConfig.backgroundOverlay.enabled
				? 'block'
				: 'none',
			'--settings-bg-background-overlay-color': globalConfig.backgroundOverlay.color,
			'--settings-bg-background-overlay-opacity': globalConfig.backgroundOverlay.opacity.toString(),
			'--settings-bg-background-overlay-filters': backgroundOverlayFiltersString,
			'--settings-bg-top-overlay-enabled': globalConfig.topOverlay.enabled ? 'block' : 'none',
			'--settings-bg-top-overlay-color': globalConfig.topOverlay.color,
			'--settings-bg-top-overlay-opacity': globalConfig.topOverlay.opacity.toString(),
			'--settings-bg-top-overlay-filters': topOverlayFiltersString,
			'--settings-bg-animation-duration': `${globalConfig.animationDuration}ms`
		};
	}

	// 转换显示模式为 CSS 值
	function convertDisplayModeToCSS(displayMode: string): string {
		switch (displayMode) {
			case 'cover':
				return 'cover';
			case 'contain':
				return 'contain';
			case 'stretch':
				return '100% 100%';
			case 'tile':
				return 'auto';
			case 'center':
				return 'auto';
			default:
				return 'cover';
		}
	}

	// 转换位置为 CSS 值
	function convertPositionToCSS(position: string): string {
		switch (position) {
			case 'top-left':
				return 'left top';
			case 'top-center':
				return 'center top';
			case 'top-right':
				return 'right top';
			case 'center-left':
				return 'left center';
			case 'center':
				return 'center center';
			case 'center-right':
				return 'right center';
			case 'bottom-left':
				return 'left bottom';
			case 'bottom-center':
				return 'center bottom';
			case 'bottom-right':
				return 'right bottom';
			default:
				return 'center center';
		}
	}

	// 生成滤镜字符串
	function generateFiltersString(filters: BackgroundFilters): string {
		const filterParts: string[] = [];

		if (filters.brightness !== undefined && filters.brightness !== 1) {
			filterParts.push(`brightness(${filters.brightness})`);
		}
		if (filters.contrast !== undefined && filters.contrast !== 1) {
			filterParts.push(`contrast(${filters.contrast})`);
		}
		if (filters.saturate !== undefined && filters.saturate !== 1) {
			filterParts.push(`saturate(${filters.saturate})`);
		}
		if (filters.blur !== undefined && filters.blur > 0) {
			filterParts.push(`blur(${filters.blur}px)`);
		}
		if (filters.grayscale !== undefined && filters.grayscale > 0) {
			filterParts.push(`grayscale(${filters.grayscale})`);
		}
		if (filters.hueRotate !== undefined && filters.hueRotate !== 0) {
			filterParts.push(`hue-rotate(${filters.hueRotate}deg)`);
		}
		if (filters.invert !== undefined && filters.invert > 0) {
			filterParts.push(`invert(${filters.invert})`);
		}

		return filterParts.length > 0 ? filterParts.join(' ') : 'none';
	}

	// 应用背景样式到元素
	export function applyBackgroundStyles(
		element: HTMLElement | null,
		styles: Record<string, string>
	): void {
		if (!element || !element.style) return;
		Object.entries(styles).forEach(([property, value]) => {
			if (element && element.style) {
				element.style.setProperty(property, value);
			}
		});
	}

	// 移除背景样式
	export function removeBackgroundStyles(element: HTMLElement | null): void {
		if (!element || !element.style) return;
		const properties = [
			'--settings-bg-image',
			'--settings-bg-opacity',
			'--settings-bg-size',
			'--settings-bg-position',
			'--settings-bg-blend-mode',
			'--settings-bg-filters',
			'--settings-bg-scale',
			'--settings-bg-rotation',
			'--settings-bg-offset-x',
			'--settings-bg-offset-y',
			'--settings-bg-background-overlay-enabled',
			'--settings-bg-background-overlay-color',
			'--settings-bg-background-overlay-opacity',
			'--settings-bg-background-overlay-filters',
			'--settings-bg-top-overlay-enabled',
			'--settings-bg-top-overlay-filters',
			'--settings-bg-animation-duration'
		];

		properties.forEach((property) => {
			if (element && element.style) {
				element.style.removeProperty(property);
			}
		});
	}

	// 防抖函数，用于优化配置变更时的性能
	export function debounce<T extends (...args: any[]) => any>(
		func: T,
		wait: number
	): (...args: Parameters<T>) => void {
		let timeout: ReturnType<typeof setTimeout>;
		return (...args: Parameters<T>) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => func(...args), wait);
		};
	}

	// 颜色工具函数
	export function hexToRgba(hex: string, alpha: number = 1): string {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (!result) return `rgba(0, 0, 0, ${alpha})`;

		const r = parseInt(result[1], 16);
		const g = parseInt(result[2], 16);
		const b = parseInt(result[3], 16);

		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	// 格式化文件大小
	export function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
</script>
