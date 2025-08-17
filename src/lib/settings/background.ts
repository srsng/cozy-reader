// 背景图片铺设方式
export type BackgroundSize =
	| 'auto' // 原始尺寸
	| 'cover' // 覆盖整个容器，保持比例
	| 'contain' // 完整显示图片，保持比例
	| 'stretch' // 拉伸填充整个容器
	| 'repeat' // 重复平铺
	| 'repeat-x' // 水平重复
	| 'repeat-y' // 垂直重复
	| 'no-repeat'; // 不重复

// 背景图片位置
export type BackgroundPosition =
	| 'left top'
	| 'top'
	| 'right top'
	| 'left'
	| 'center'
	| 'right'
	| 'left bottom'
	| 'bottom'
	| 'right bottom'
	| 'left center'
	| 'center center'
	| 'right center'
	| 'top center'
	| 'bottom center';

// 背景图片重复方式
export type BackgroundRepeat =
	| 'repeat' // 默认重复
	| 'no-repeat' // 不重复
	| 'repeat-x' // 水平重复
	| 'repeat-y' // 垂直重复
	| 'space' // 重复并均匀分布
	| 'round' // 重复并拉伸填充
	| 'initial' // 初始值
	| 'inherit'; // 继承

// 背景图片附件方式（滚动行为）
export type BackgroundAttachment =
	| 'scroll' // 随内容滚动
	| 'fixed' // 固定位置
	| 'local' // 随元素滚动
	| 'initial' // 初始值
	| 'inherit'; // 继承

// 背景图片混合模式
export type BackgroundBlendMode =
	| 'normal' // 正常
	| 'multiply' // 正片叠底
	| 'screen' // 滤色
	| 'overlay' // 叠加
	| 'darken' // 变暗
	| 'lighten' // 变亮
	| 'color-dodge' // 颜色减淡
	| 'color-burn' // 颜色加深
	| 'hard-light' // 强光
	| 'soft-light' // 柔光
	| 'difference' // 差值
	| 'exclusion' // 排除
	| 'hue' // 色相
	| 'saturation' // 饱和度
	| 'color' // 颜色
	| 'luminosity'; // 亮度

// 背景图片滤镜效果
export interface BackgroundFilters {
	brightness?: number; // 亮度 (0-2, 1为正常)
	contrast?: number; // 对比度 (0-2, 1为正常)
	saturate?: number; // 饱和度 (0-2, 1为正常)
	blur?: number; // 模糊 (0-20px)
	grayscale?: number; // 灰度 (0-1, 0为正常)
	sepia?: number; // 棕褐色 (0-1, 0为正常)
	hueRotate?: number; // 色相旋转 (0-360deg)
	invert?: number; // 反转 (0-1, 0为正常)
	opacity?: number; // 透明度 (0-1, 1为正常)
}

// 全局背景配置（作为默认值）
export interface GlobalBackgroundConfig {
	opacity: number; // 默认透明度 (0-1)
	size: BackgroundSize; // 默认尺寸/铺设方式
	position: BackgroundPosition; // 默认位置
	repeat: BackgroundRepeat; // 默认重复方式
	attachment: BackgroundAttachment; // 默认滚动行为
	blendMode: BackgroundBlendMode; // 默认混合模式
	filters: BackgroundFilters; // 默认滤镜效果
	scale: number; // 默认缩放比例 (0.1-3)
	rotation: number; // 默认旋转角度 (0-360deg)
	offsetX: number; // 默认水平偏移 (px)
	offsetY: number; // 默认垂直偏移 (px)
}

// 单个背景图片配置（大部分参数可选，使用全局配置作为默认值）
export interface BackgroundImage {
	id: string; // 唯一标识符
	name: string; // 显示名称
	filePath: string; // 文件路径
	enabled: boolean; // 是否启用
	priority: number; // 优先级 (数字越小优先级越高)

	// 可选的自定义配置，如果不设置则使用全局配置
	opacity?: number; // 透明度 (0-1)
	size?: BackgroundSize; // 尺寸/铺设方式
	position?: BackgroundPosition; // 位置
	repeat?: BackgroundRepeat; // 重复方式
	attachment?: BackgroundAttachment; // 滚动行为
	blendMode?: BackgroundBlendMode; // 混合模式
	filters?: Partial<BackgroundFilters>; // 滤镜效果（部分可选）
	scale?: number; // 缩放比例 (0.1-3)
	rotation?: number; // 旋转角度 (0-360deg)
	offsetX?: number; // 水平偏移 (px)
	offsetY?: number; // 垂直偏移 (px)
}

// 背景图片集合配置
export interface BackgroundSettings {
	images: BackgroundImage[]; // 背景图片列表
	activeImageId: string | null; // 当前激活的图片ID

	// 全局背景配置（作为默认值）
	globalConfig: GlobalBackgroundConfig;

	// 全局效果控制
	globalOpacity: number; // 全局透明度 (0-1)
	globalFilters: BackgroundFilters; // 全局滤镜效果
	enableBlur: boolean; // 是否启用背景模糊
	blurRadius: number; // 背景模糊半径 (0-20px)
	enableOverlay: boolean; // 是否启用遮罩层
	overlayColor: string; // 遮罩层颜色 (CSS颜色值)
	overlayOpacity: number; // 遮罩层透明度 (0-1)
	enableAnimation: boolean; // 是否启用动画效果
	animationDuration: number; // 动画持续时间 (ms)
	animationEasing: string; // 动画缓动函数
}

// 默认全局背景配置
export const DefaultGlobalBackgroundConfig: GlobalBackgroundConfig = {
	opacity: 1,
	size: 'cover',
	position: 'center center',
	repeat: 'no-repeat',
	attachment: 'scroll',
	blendMode: 'normal',
	filters: {
		brightness: 1,
		contrast: 1,
		saturate: 1,
		blur: 0,
		grayscale: 0,
		sepia: 0,
		hueRotate: 0,
		invert: 0,
		opacity: 1
	},
	scale: 1,
	rotation: 0,
	offsetX: 0,
	offsetY: 0
};

// 默认背景图片配置
export const DefaultBackgroundImage: BackgroundImage = {
	id: '',
	name: '默认背景',
	filePath: '',
	enabled: false,
	priority: 0
	// 其他参数使用全局配置的默认值
};

// 默认背景设置
export const DefaultBackgroundSettings: BackgroundSettings = {
	images: [],
	activeImageId: null,
	globalConfig: DefaultGlobalBackgroundConfig,
	globalOpacity: 1,
	globalFilters: {
		brightness: 1,
		contrast: 1,
		saturate: 1,
		blur: 0,
		grayscale: 0,
		sepia: 0,
		hueRotate: 0,
		invert: 0,
		opacity: 1
	},
	enableBlur: false,
	blurRadius: 5,
	enableOverlay: false,
	overlayColor: '#000000',
	overlayOpacity: 0.3,
	enableAnimation: false,
	animationDuration: 300,
	animationEasing: 'ease-in-out'
};

// 背景尺寸选项
export const BackgroundSizeOptions = [
	{ value: 'auto', label: '原始尺寸' },
	{ value: 'cover', label: '覆盖填充' },
	{ value: 'contain', label: '完整显示' },
	{ value: 'stretch', label: '拉伸填充' },
	{ value: 'repeat', label: '重复平铺' },
	{ value: 'repeat-x', label: '水平重复' },
	{ value: 'repeat-y', label: '垂直重复' },
	{ value: 'no-repeat', label: '不重复' }
];

// 背景位置选项
export const BackgroundPositionOptions = [
	{ value: 'left top', label: '左上' },
	{ value: 'top', label: '顶部居中' },
	{ value: 'right top', label: '右上' },
	{ value: 'left', label: '左侧居中' },
	{ value: 'center', label: '居中' },
	{ value: 'right', label: '右侧居中' },
	{ value: 'left bottom', label: '左下' },
	{ value: 'bottom', label: '底部居中' },
	{ value: 'right bottom', label: '右下' }
];

// 混合模式选项
export const BlendModeOptions = [
	{ value: 'normal', label: '正常' },
	{ value: 'multiply', label: '正片叠底' },
	{ value: 'screen', label: '滤色' },
	{ value: 'overlay', label: '叠加' },
	{ value: 'darken', label: '变暗' },
	{ value: 'lighten', label: '变亮' },
	{ value: 'color-dodge', label: '颜色减淡' },
	{ value: 'color-burn', label: '颜色加深' },
	{ value: 'hard-light', label: '强光' },
	{ value: 'soft-light', label: '柔光' },
	{ value: 'difference', label: '差值' },
	{ value: 'exclusion', label: '排除' },
	{ value: 'hue', label: '色相' },
	{ value: 'saturation', label: '饱和度' },
	{ value: 'color', label: '颜色' },
	{ value: 'luminosity', label: '亮度' }
];

// 滚动行为选项
export const AttachmentOptions = [
	{ value: 'scroll', label: '随内容滚动' },
	{ value: 'fixed', label: '固定位置' },
	{ value: 'local', label: '随元素滚动' }
];

// 缓动函数选项
export const EasingOptions = [
	{ value: 'ease', label: '缓动' },
	{ value: 'ease-in', label: '缓入' },
	{ value: 'ease-out', label: '缓出' },
	{ value: 'ease-in-out', label: '缓入缓出' },
	{ value: 'linear', label: '线性' },
	{ value: 'cubic-bezier(0.4, 0, 0.2, 1)', label: '平滑' },
	{ value: 'cubic-bezier(0.25, 0.1, 0.25, 1)', label: '弹性' }
];

// 工具函数：获取图片的完整配置（合并全局配置和图片自定义配置）
export function getImageFullConfig(
	image: BackgroundImage,
	globalConfig: GlobalBackgroundConfig
): Required<Omit<BackgroundImage, 'id' | 'name' | 'filePath' | 'enabled' | 'priority'>> {
	return {
		opacity: image.opacity ?? globalConfig.opacity,
		size: image.size ?? globalConfig.size,
		position: image.position ?? globalConfig.position,
		repeat: image.repeat ?? globalConfig.repeat,
		attachment: image.attachment ?? globalConfig.attachment,
		blendMode: image.blendMode ?? globalConfig.blendMode,
		filters: {
			...globalConfig.filters,
			...image.filters
		},
		scale: image.scale ?? globalConfig.scale,
		rotation: image.rotation ?? globalConfig.rotation,
		offsetX: image.offsetX ?? globalConfig.offsetX,
		offsetY: image.offsetY ?? globalConfig.offsetY
	};
}

// 工具函数：检查图片是否有自定义配置
export function hasImageCustomConfig(image: BackgroundImage): boolean {
	return !!(
		image.opacity !== undefined ||
		image.size !== undefined ||
		image.position !== undefined ||
		image.repeat !== undefined ||
		image.attachment !== undefined ||
		image.blendMode !== undefined ||
		image.filters !== undefined ||
		image.scale !== undefined ||
		image.rotation !== undefined ||
		image.offsetX !== undefined ||
		image.offsetY !== undefined
	);
}

// 工具函数：创建新的背景图片（使用全局配置作为默认值）
export function createBackgroundImage(
	partialConfig: Partial<Omit<BackgroundImage, 'id' | 'enabled'>>,
	globalConfig: GlobalBackgroundConfig
): BackgroundImage {
	return {
		id: crypto.randomUUID(),
		name: partialConfig.name ?? '新背景图片',
		filePath: partialConfig.filePath ?? '',
		enabled: false,
		priority: partialConfig.priority ?? 0,
		...partialConfig
	};
}

// 工具函数：重置图片配置为全局默认值
export function resetImageToGlobalDefaults(
	image: BackgroundImage,
	globalConfig: GlobalBackgroundConfig
): BackgroundImage {
	return {
		...image,
		opacity: undefined,
		size: undefined,
		position: undefined,
		repeat: undefined,
		attachment: undefined,
		blendMode: undefined,
		filters: undefined,
		scale: undefined,
		rotation: undefined,
		offsetX: undefined,
		offsetY: undefined
	};
}
