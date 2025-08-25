export const APP_TITLE = 'Cozy Reader';

export type AppState = {
	appTitle: string;
	fullscreen: boolean;
};

export const DEFAULT_APP_STATE: AppState = {
	appTitle: APP_TITLE,
	fullscreen: false
};
