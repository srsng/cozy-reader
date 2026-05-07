/**
 * Reader 设置 Store
 * 独立的 Reader 设置持久化存储，参考 userSettings.ts 的实现
 */

import { writable, type Writable, get } from 'svelte/store';
import { LazyStore } from '@tauri-apps/plugin-store';
import { DEFAULT_READER_SETTINGS, type ReaderSettings } from '../settings';
import { InjectionToken } from '$lib/utils/context';

export const READER_SETTINGS_KEY_STR = 'reader-settings';
// reader settings context Key
export const READER_SETTINGS = new InjectionToken<Writable<ReaderSettings>>(
    READER_SETTINGS_KEY_STR
);

// 创建配置存储
const readerConfigStore = new LazyStore('reader-settings.json');

/**
 * 更新并保存 Reader 设置
 *
 * @param value ReaderSettings 对象
 */
async function saveReaderConfigStore(value: ReaderSettings) {
    const cleanValue = clean(value);
    await readerConfigStore.set(READER_SETTINGS_KEY_STR, cleanValue);
    return readerConfigStore.save();
}

// 延时保存
let timer: ReturnType<typeof setTimeout>;
// timer 状态
let waitingToSave: boolean = false;

function clean(value: any) {
    return JSON.parse(JSON.stringify(value));
}

/**
 * 如果有较新的设置未保存，立即保存 Reader 设置
 */
export async function saveReaderSettingsManually(store: Writable<ReaderSettings>): Promise<void> {
    console.log('try to save ReaderSettings Manually');
    if (waitingToSave) {
        clearTimeout(timer);
        waitingToSave = false;
        forceSaveReaderSettings(store);
        console.log('saveReaderSettingsManually success');
    }
}

/**
 * 强制立即保存 Reader 设置
 */
export async function forceSaveReaderSettings(store: Writable<ReaderSettings>): Promise<void> {
    const currentValue = get(store);
    return saveReaderConfigStore(currentValue);
}

/**
 * 加载 Reader 设置
 */
export async function loadReaderSettings(): Promise<Writable<ReaderSettings>> {
    const store = writable<ReaderSettings>(DEFAULT_READER_SETTINGS);
    const savedConfig = await readerConfigStore.get(READER_SETTINGS_KEY_STR);
    const cleanConfig = savedConfig ? clean(savedConfig) : null;

    if (cleanConfig) {
        const mergedConfig = {
            ...DEFAULT_READER_SETTINGS,
            ...cleanConfig
        };
        store.set(mergedConfig);
    }

    // 订阅，自动保存
    store.subscribe((value) => {
        if (timer) clearTimeout(timer);
        waitingToSave = true;
        timer = setTimeout(() => {
            waitingToSave = false;
            saveReaderConfigStore(value);
        }, 10000); // 10秒防抖
    });

    return {
        subscribe: store.subscribe,
        set: store.set,
        update: store.update
    };
}
