export interface LayoutSettings {
	titlebar: boolean;
	header: boolean;
	footer: boolean;
	layoutConfigs: LayoutConfigs;
}

export interface LayoutConfigs {
	titlebar: BarConfig;
	footbar: BarConfig;
	sidebar: BarConfig;
}

export interface ButtonConfig {
	name: string;
	type: ButtonType;
	enabled: boolean;
	// 排序
	order: number;
	// 区别文本与icon, 默认icon
	mode?: undefined | 'icon' | 'text';
	// 自定义属性参数
	customProps?: Record<string, any>;
}

export interface BarConfig {
	// left or up
	left: ButtonConfig[];
	// center or middle
	center: ButtonConfig[];
	// right or down
	right: ButtonConfig[];
}

// 定义 enum
export enum ButtonTypeEnum {
	Home = 'home',
	Back = 'back',
	Settings = 'settings',
	BackgroundSettings = 'background-settings',
	Refresh = 'refresh',
	Zoom = 'zoom',
	AppIcon = 'app-icon',
	AppTitle = 'app-title',
	AlwaysOnTop = 'always-on-top',
	Drag = 'drag',
	Minimize = 'minimize',
	Maximize = 'maximize',
	Fullscreen = 'fullscreen',
	Close = 'close',
	ThemeToggle = 'theme-toggle',
	Custom = 'custom'
}

// 从 enum 生成 union type
export type ButtonType = `${ButtonTypeEnum}`;

// 获取所有按钮类型的辅助函数
export const ALL_BUTTON_TYPES = Object.values(ButtonTypeEnum);

// 为了向后兼容，也可以直接使用 enum 值
export const ButtonType = ButtonTypeEnum;

// 按钮类型的名称映射
export const buttonTypeLabels: Record<ButtonType, string> = {
	home: '主页',
	back: '返回',
	settings: '设置',
	refresh: '刷新',
	zoom: '缩放',
	'app-icon': '应用图标',
	'app-title': '应用标题',
	'always-on-top': '置顶',
	drag: '拖拽',
	minimize: '最小化',
	maximize: '最大化',
	fullscreen: '全屏',
	close: '关闭',
	'theme-toggle': '主题切换',
	custom: '自定义',
	'background-settings': '背景设置'
};

const NULLBarConfig: BarConfig = {
	left: [],
	center: [],
	right: []
};

export const DefaultTitleBarConfig: BarConfig = {
	left: [
		{
			name: 'home',
			type: 'home',
			enabled: true,
			order: 0
		},
		{
			name: 'settings',
			type: 'settings',
			enabled: true,
			order: 1
		},
		{
			name: 'background-settings',
			type: 'background-settings',
			enabled: true,
			order: 2
		},
		{
			name: 'refresh',
			type: 'refresh',
			enabled: true,
			order: 3
		},
		{
			name: 'zoom',
			type: 'zoom',
			enabled: true,
			order: 4
		}
	],
	center: [
		{
			name: 'app-icon',
			type: 'app-icon',
			enabled: true,
			order: 0
		},
		{
			name: 'app-title',
			type: 'app-title',
			enabled: true,
			order: 1,
			mode: 'text'
		}
	],
	right: [
		{
			name: 'theme-toggle',
			type: 'theme-toggle',
			enabled: true,
			order: 0
		},
		{
			name: 'always-on-top',
			type: 'always-on-top',
			enabled: true,
			order: 1
		},
		{
			name: 'minimize',
			type: 'minimize',
			enabled: true,
			order: 2
		},
		{
			name: 'maximize',
			type: 'maximize',
			enabled: true,
			order: 3
		},
		{
			name: 'close',
			type: 'close',
			enabled: true,
			order: 4
		}
	]
};

export const DefaultFootBarConfig: BarConfig = NULLBarConfig;
export const DefaultSideBarConfig: BarConfig = NULLBarConfig;

export const DefaultLayoutConfigs: LayoutConfigs = {
	titlebar: DefaultTitleBarConfig,
	footbar: DefaultFootBarConfig,
	sidebar: DefaultSideBarConfig
};

export const DefaultLayoutSettings: LayoutSettings = {
	titlebar: true,
	header: true,
	footer: true,
	layoutConfigs: DefaultLayoutConfigs
};
