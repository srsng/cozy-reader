import { writable, get, derived, type Writable } from 'svelte/store';
import { LazyStore } from '@tauri-apps/plugin-store';
import { DEFAULT_SETTINGS, SETTINGS_KEY, type Settings } from '$lib/settings';

// 创建配置存储
const configStore = new LazyStore('settings.json');

function clean(value: any) {
	return JSON.parse(JSON.stringify(value));
}

export async function loadUserSettings(): Promise<Writable<Settings>> {
	const store = writable<Settings>(DEFAULT_SETTINGS);
	const savedConfig = await configStore.get(SETTINGS_KEY);
	const cleanConfig = savedConfig ? clean(savedConfig) : null;

	if (cleanConfig) {
		store.set({ ...DEFAULT_SETTINGS, ...cleanConfig });
	}

	// 订阅，自动保存
	store.subscribe((value) => {
		const cleanValue = clean(value);
		configStore.set(SETTINGS_KEY, cleanValue);
		configStore.save();
	});

	return {
		subscribe: store.subscribe,
		set: store.set,
		update: store.update
	};
}
