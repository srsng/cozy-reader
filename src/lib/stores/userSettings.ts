import { writable, type Writable } from 'svelte/store';
import { LazyStore } from '@tauri-apps/plugin-store';
import { DEFAULT_SETTINGS, type UserSettings } from '$lib/settings';
import { InjectionToken } from '$lib/utils/context';

export const USER_SETTINGS_KEY_STR = 'user-settings';
// user settings context Key
export const USER_SETTINGS = new InjectionToken<Writable<UserSettings>>(USER_SETTINGS_KEY_STR);

// 创建配置存储
const configStore = new LazyStore('settings.json');

// 延时保存
let timer: ReturnType<typeof setTimeout>;

function clean(value: any) {
	return JSON.parse(JSON.stringify(value));
}

export async function loadUserSettings(): Promise<Writable<UserSettings>> {
	const store = writable<UserSettings>(DEFAULT_SETTINGS);
	const savedConfig = await configStore.get(USER_SETTINGS_KEY_STR);
	const cleanConfig = savedConfig ? clean(savedConfig) : null;

	if (cleanConfig) {
		// 深度合并配置，确保背景设置正确初始化
		const mergedConfig = {
			...DEFAULT_SETTINGS,
			...cleanConfig,
			background: {
				...DEFAULT_SETTINGS.background,
				...cleanConfig.background,
				global: {
					...DEFAULT_SETTINGS.background.global,
					...cleanConfig.background?.global
				}
			}
		};
		store.set(mergedConfig);
	}

	// todo：添加立即保存

	// 订阅，自动保存
	store.subscribe((value) => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			const cleanValue = clean(value);
			configStore.set(USER_SETTINGS_KEY_STR, cleanValue);
			configStore.save();
		}, 10000); // 防抖
	});

	return {
		subscribe: store.subscribe,
		set: store.set,
		update: store.update
	};
}
