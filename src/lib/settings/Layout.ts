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
	id: string;
	type: ButtonType;
	enabled: boolean;
	order: number;
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

export type ButtonType =
	| 'home'
	| 'settings'
	| 'refresh'
	| 'zoom'
	| 'app-icon'
	| 'app-title'
	| 'always-on-top'
	| 'drag'
	| 'minimize'
	| 'maximize'
	| 'close'
	| 'theme-toggle';

const NULLBarConfig: BarConfig = {
	left: [],
	center: [],
	right: []
};

export const DefaultTitleBarConfig: BarConfig = {
	left: [
		{
			id: 'home',
			type: 'home',
			enabled: true,
			order: 0
		},
		{
			id: 'settings',
			type: 'settings',
			enabled: true,
			order: 1
		},
		{
			id: 'refresh',
			type: 'refresh',
			enabled: true,
			order: 2
		},
		{
			id: 'zoom',
			type: 'zoom',
			enabled: true,
			order: 3
		}
	],
	center: [
		{
			id: 'app-icon',
			type: 'app-icon',
			enabled: true,
			order: 0
		},
		{
			id: 'app-title',
			type: 'app-title',
			enabled: true,
			order: 1
		}
	],
	right: [
		{
			id: 'theme-toggle',
			type: 'theme-toggle',
			enabled: true,
			order: 0
		},
		{
			id: 'always-on-top',
			type: 'always-on-top',
			enabled: true,
			order: 1
		},
		{
			id: 'drag',
			type: 'drag',
			enabled: true,
			order: 2
		},
		{
			id: 'minimize',
			type: 'minimize',
			enabled: true,
			order: 3
		},
		{
			id: 'maximize',
			type: 'maximize',
			enabled: true,
			order: 4
		},
		{
			id: 'close',
			type: 'close',
			enabled: true,
			order: 5
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
