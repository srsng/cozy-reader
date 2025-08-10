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
	| 'theme-toggle'
	| 'custom';

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
			name: 'refresh',
			type: 'refresh',
			enabled: true,
			order: 2
		},
		{
			name: 'zoom',
			type: 'zoom',
			enabled: true,
			order: 3
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
			order: 1
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
			name: 'drag',
			type: 'drag',
			enabled: true,
			order: 2
		},
		{
			name: 'minimize',
			type: 'minimize',
			enabled: true,
			order: 3
		},
		{
			name: 'maximize',
			type: 'maximize',
			enabled: true,
			order: 4
		},
		{
			name: 'close',
			type: 'close',
			enabled: true,
			order: 5,
			customProps: {
				className: 'hover:bg-destructive hover:text-destructive-foreground'
			}
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
