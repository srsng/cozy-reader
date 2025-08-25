export const DEFAULT_OPACITY = 0.96;

// 背景显示模式/铺设方式
export type BackgroundDisplayMode =
	| 'cover' // 覆盖填充（最常用）
	| 'contain' // 完整显示
	| 'stretch' // 拉伸填充
	| 'tile' // 平铺重复
	| 'center'; // 居中显示

// 背景位置（9宫格）
export type BackgroundPosition =
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'center-left'
	| 'center'
	| 'center-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right';

// 混合模式（保留常用的）
export type BackgroundBlendMode =
	| 'normal' // 正常
	| 'multiply' // 正片叠底
	| 'screen' // 滤色
	| 'overlay' // 叠加
	| 'soft-light' // 柔光
	| 'darken' // 变暗
	| 'lighten'; // 变亮

// 背景滤镜配置
export interface BackgroundFilters {
	brightness: number; // 亮度 (0-2, 默认1)
	contrast: number; // 对比度 (0-2, 默认1)
	saturate: number; // 饱和度 (0-2, 默认1)
	blur: number; // 模糊 (0-20px, 默认0)
	grayscale: number; // 灰度 (0-1, 默认0)
	hueRotate: number; // 色相旋转 (0-360deg)
	invert: number; // 反转 (0-1, 0为正常)
}

// 遮罩层配置
export interface OverlayConfig {
	enabled: boolean; // 是否启用遮罩层
	color: string; // 遮罩颜色
	opacity: number; // 遮罩透明度 (0-1)
	filters: BackgroundFilters; // 滤镜配置
}

// 全局背景配置
export interface GlobalBackgroundConfig {
	// 基础显示设置
	opacity: number; // 透明度 (0-1)
	displayMode: BackgroundDisplayMode; // 显示模式
	position: BackgroundPosition; // 位置
	blendMode: BackgroundBlendMode; // 混合模式

	// 滤镜效果
	filters: BackgroundFilters;

	// 遮罩层配置
	backgroundOverlay: OverlayConfig; // 背景遮罩层配置
	topOverlay: OverlayConfig; // 上层遮罩层配置

	// 动画设置
	enableAnimation: boolean; // 是否启用切换动画
	animationDuration: number; // 动画持续时间 (ms)
}

// 图片自定义配置类型
export interface ImageCustomConfig {
	// 基础显示设置
	opacity: number; // 透明度 (0-1)
	displayMode: BackgroundDisplayMode; // 显示模式
	position: BackgroundPosition; // 位置
	blendMode: BackgroundBlendMode; // 混合模式

	// 滤镜效果
	filters?: BackgroundFilters;

	// 变换设置
	scale: number; // 缩放比例 (0.1-5.0)
	rotation: number; // 旋转角度 (0-360)
	offsetX: number; // X轴偏移 (-1000 到 1000)
	offsetY: number; // Y轴偏移 (-1000 到 1000)
}

// 单个背景图片配置
export interface BackgroundImage {
	id: string; // 唯一标识符
	name: string; // 显示名称
	filePath: string; // 文件路径
	internal: boolean; // 是否为应用内置图片
	createdAt: number; // 创建时间戳

	enableConfig: boolean; // 是否启用自定义配置
	config?: ImageCustomConfig; // 可选的自定义配置，如果不设置则使用全局配置
}

// 背景图片集合配置
export interface BackgroundSettings {
	images: BackgroundImage[]; // 背景图片列表
	activeImageId: string | null; // 当前激活的图片ID
	// 全局配置
	global: GlobalBackgroundConfig;
}

// 默认滤镜配置
export const DefaultBackgroundFilters: BackgroundFilters = {
	brightness: 1,
	contrast: 1,
	saturate: 1,
	blur: 0,
	grayscale: 0,
	hueRotate: 0,
	invert: 0
};

// 默认遮罩层配置
export const DefaultOverlayConfig: OverlayConfig = {
	enabled: false,
	color: '#000000',
	opacity: 0.1,
	filters: { ...DefaultBackgroundFilters }
};

// 默认全局背景配置
export const DefaultGlobalBackgroundConfig: GlobalBackgroundConfig = {
	opacity: 0.1,
	displayMode: 'cover',
	position: 'center',
	blendMode: 'normal',
	filters: DefaultBackgroundFilters,
	backgroundOverlay: DefaultOverlayConfig,
	topOverlay: DefaultOverlayConfig,
	enableAnimation: true,
	animationDuration: 300
};

// 默认图片自定义配置
export const DefaultImageCustomConfig: ImageCustomConfig = {
	// 基础显示设置
	opacity: 0.1,
	displayMode: 'cover',
	position: 'center',
	blendMode: 'normal',

	// 滤镜效果（可选）
	// filters: undefined, // 默认不启用滤镜

	// 变换设置
	scale: 1.0,
	rotation: 0,
	offsetX: 0,
	offsetY: 0
};

// 默认背景图片配置
export const DefaultBackgroundImage: Omit<BackgroundImage, 'id'> = {
	name: '默认背景',
	filePath: '',
	internal: false,
	createdAt: Date.now(),
	enableConfig: false
};

// 默认背景设置
export const DefaultBackgroundSettings: BackgroundSettings = {
	images: [],
	activeImageId: null,
	global: DefaultGlobalBackgroundConfig
};

// 显示模式选项
export const DisplayModeOptions = [
	{ value: 'cover', label: '覆盖填充' },
	{ value: 'contain', label: '完整显示' },
	{ value: 'stretch', label: '拉伸填充' },
	{ value: 'tile', label: '平铺重复' },
	{ value: 'center', label: '居中显示' }
];

// 背景位置选项（9宫格）
export const BackgroundPositionOptions = [
	{ value: 'top-left', label: '左上' },
	{ value: 'top-center', label: '上中' },
	{ value: 'top-right', label: '右上' },
	{ value: 'center-left', label: '左中' },
	{ value: 'center', label: '居中' },
	{ value: 'center-right', label: '右中' },
	{ value: 'bottom-left', label: '左下' },
	{ value: 'bottom-center', label: '下中' },
	{ value: 'bottom-right', label: '右下' }
];

// 混合模式选项
export const BlendModeOptions = [
	{ value: 'normal', label: '正常' },
	{ value: 'multiply', label: '正片叠底' },
	{ value: 'screen', label: '滤色' },
	{ value: 'overlay', label: '叠加' },
	{ value: 'soft-light', label: '柔光' },
	{ value: 'darken', label: '变暗' },
	{ value: 'lighten', label: '变亮' }
];

// 工具函数：获取图片的完整配置（合并全局配置和图片自定义配置）
export function getImageFullConfig(
	image: BackgroundImage,
	globalConfig: GlobalBackgroundConfig
): ImageCustomConfig {
	if (image.enableConfig && image.config) {
		return image.config;
	}

	return {
		// 基础显示设置
		opacity: globalConfig.opacity,
		displayMode: globalConfig.displayMode,
		position: globalConfig.position,
		blendMode: globalConfig.blendMode,

		// 滤镜效果
		filters: globalConfig.filters,

		// 变换设置（使用默认值）
		scale: 1.0,
		rotation: 0,
		offsetX: 0,
		offsetY: 0
	};
}

// 工具函数：检查图片是否有自定义配置
export function hasImageCustomConfig(image: BackgroundImage): boolean {
	return image.enableConfig && !!image.config;
}

// 工具函数：为图片启用自定义配置时填充默认值
export function enableImageCustomConfig(image: BackgroundImage): BackgroundImage {
	return {
		...image,
		enableConfig: true,
		config: image.config || { ...DefaultImageCustomConfig }
	};
}

// 工具函数：禁用图片自定义配置
export function disableImageCustomConfig(image: BackgroundImage): BackgroundImage {
	return {
		...image,
		enableConfig: false
	};
}

// 工具函数：创建新的背景图片
export function createBackgroundImage(
	partialConfig: Partial<Omit<BackgroundImage, 'id'>>
): BackgroundImage {
	return {
		id: crypto.randomUUID(),
		name: partialConfig.name ?? '新背景图片',
		filePath: partialConfig.filePath ?? '',
		internal: partialConfig.internal ?? false,
		createdAt: partialConfig.createdAt ?? Date.now(),
		enableConfig: partialConfig.enableConfig ?? false,
		config: partialConfig.config
	};
}

// 工具函数：重置图片配置为默认值
export function resetImageToDefaults(image: BackgroundImage): BackgroundImage {
	return {
		id: image.id,
		name: image.name,
		filePath: image.filePath,
		internal: image.internal,
		createdAt: image.createdAt,
		enableConfig: false,
		config: undefined
	};
}

// 合并背景配置的辅助函数
export function mergeBackgroundConfigs(
	base: Partial<GlobalBackgroundConfig>,
	override: Partial<GlobalBackgroundConfig>
): GlobalBackgroundConfig {
	return {
		...DefaultGlobalBackgroundConfig,
		...base,
		...override,
		filters: {
			...DefaultGlobalBackgroundConfig.filters,
			...(base.filters || {}),
			...(override.filters || {})
		},
		backgroundOverlay: {
			...DefaultGlobalBackgroundConfig.backgroundOverlay,
			...(base.backgroundOverlay || {}),
			...(override.backgroundOverlay || {}),
			filters: {
				...DefaultGlobalBackgroundConfig.backgroundOverlay.filters,
				...(base.backgroundOverlay?.filters || {}),
				...(override.backgroundOverlay?.filters || {})
			}
		},
		topOverlay: {
			...DefaultGlobalBackgroundConfig.topOverlay,
			...(base.topOverlay || {}),
			...(override.topOverlay || {}),
			filters: {
				...DefaultGlobalBackgroundConfig.topOverlay.filters,
				...(base.topOverlay?.filters || {}),
				...(override.topOverlay?.filters || {})
			}
		}
	};
}
