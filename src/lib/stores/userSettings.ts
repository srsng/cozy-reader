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
		store.set({ ...DEFAULT_SETTINGS, ...cleanConfig });
	}

	// 订阅，自动保存
	store.subscribe((value) => {
		const cleanValue = clean(value);
		configStore.set(USER_SETTINGS_KEY_STR, cleanValue);
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			configStore.save();
		}, 1500); // 防抖
	});

	return {
		subscribe: store.subscribe,
		set: store.set,
		update: store.update
	};
}
