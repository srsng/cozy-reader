// import { SHORTCUT_EVENT } from '$lib/shortcuts/shortcutService';
// import { emit } from '@tauri-apps/api/event';

// todo
export enum SHORTCUT_EVENTS_ENUM {
	'zoom-in' = 'zoom-in',
	'zoom-out' = 'zoom-out',
	'zoom-reset' = 'zoom-reset',
	minimize = 'main-window-minimize',
	maximize = 'main-window-maximize',
	close = 'main-window-close',
	'toggle-always-on-top' = 'main-window-toggle-always-on-top',
	'background-image-changed' = 'background-image-changed'
}

// 从 enum 生成 union type
export type SHORTCUT_EVENTS = `${SHORTCUT_EVENTS_ENUM}`;

// export function emit_shotchut_event(event: SHORTCUT_EVENTS) {
// 	emit(SHORTCUT_EVENT, event);
// }

// 背景图片切换事件
export const BACKGROUND_EVENTS = {
	IMAGE_CHANGED: 'background-image-changed'
} as const;

export type BackgroundEventType = (typeof BACKGROUND_EVENTS)[keyof typeof BACKGROUND_EVENTS];
