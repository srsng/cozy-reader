import { writable, type Writable } from 'svelte/store';
import { LazyStore } from '@tauri-apps/plugin-store';
import { DEFAULT_SETTINGS, type UserSettings } from '$lib/settings';
import { InjectionToken } from '$lib/utils/context';

export const USER_SETTINGS_KEY_STR = 'user-settings';
// user settings context Key
export const USER_SETTINGS = new InjectionToken<Writable<UserSettings>>(USER_SETTINGS_KEY_STR);

// 创建配置存储
const configStore = new LazyStore('settings.json');

/**更新并保存用户设置
 *
 * @param value UserSettings对象
 */
async function saveConfigStore(value: UserSettings) {
    const cleanValue = clean(value);
    await configStore.set(USER_SETTINGS_KEY_STR, cleanValue);
    return configStore.save();
}

// 延时保存
let timer: ReturnType<typeof setTimeout>;
// timer状态
let wattingToSave: boolean = false;

function clean(value: any) {
    return JSON.parse(JSON.stringify(value));
}

/** 如果有较新的设置未保存，立即保存用户设置
 *
 * *具体效果待验证*
 */
export async function saveUserSettingsManually(store: Writable<UserSettings>): Promise<void> {
    console.log('try to save UserSettings Manually');
    if (wattingToSave) {
        clearTimeout(timer);
        wattingToSave = false;
        forceSaveUserSettings(store);
        console.log('saveUserSettingsManually success');
    }
}

/** 强制立即保存用户设置 */
export async function forceSaveUserSettings(store: Writable<UserSettings>): Promise<void> {
    let currentValue: UserSettings;
    const unsubscribe = store.subscribe((value) => {
        currentValue = value;
    });
    unsubscribe(); // 立即取消订阅，只获取当前值

    return saveConfigStore(currentValue!);
}

export async function loadUserSettings(): Promise<Writable<UserSettings>> {
    const store = writable<UserSettings>(DEFAULT_SETTINGS);
    const savedConfig = await configStore.get(USER_SETTINGS_KEY_STR);
    const cleanConfig = savedConfig ? clean(savedConfig) : null;

    if (cleanConfig) {
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

    // 订阅，自动保存
    store.subscribe((value) => {
        if (timer) clearTimeout(timer);
        wattingToSave = true;
        timer = setTimeout(() => {
            wattingToSave = false;
            saveConfigStore(value);
        }, 10000); // 防抖
    });

    return {
        subscribe: store.subscribe,
        set: store.set,
        update: store.update
    };
}
