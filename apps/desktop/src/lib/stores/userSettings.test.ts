import { beforeEach, describe, expect, it, vi } from 'vitest';

const storeSet = vi.fn();
const storeSave = vi.fn();
const storeGet = vi.fn();

vi.mock('@tauri-apps/plugin-store', () => ({
    LazyStore: vi.fn(function LazyStore() {
        return {
            get: storeGet,
            set: storeSet,
            save: storeSave
        };
    })
}));

vi.mock('mode-watcher', () => ({
    mode: { current: 'system' }
}));

vi.mock('$lib/apis/platform', () => ({
    getSystemLocale: vi.fn(() => Promise.resolve('zh-CN'))
}));

describe('user settings store', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.useRealTimers();
        storeGet.mockResolvedValue(null);
        storeSet.mockResolvedValue(undefined);
        storeSave.mockResolvedValue(undefined);
        storeGet.mockClear();
        storeSet.mockClear();
        storeSave.mockClear();
    });

    it('awaits pending debounced saves when saving manually', async () => {
        vi.useFakeTimers();
        const { loadUserSettings, saveUserSettingsManually, USER_SETTINGS_KEY_STR } = await import(
            './userSettings'
        );
        const settings = await loadUserSettings();

        settings.update((value) => ({
            ...value,
            base: {
                ...value.base,
                zoom: 1.25
            }
        }));

        const manualSave = saveUserSettingsManually(settings);

        expect(storeSave).not.toHaveBeenCalled();

        await manualSave;
        vi.advanceTimersByTime(10000);

        expect(storeSet).toHaveBeenCalledWith(
            USER_SETTINGS_KEY_STR,
            expect.objectContaining({
                base: expect.objectContaining({ zoom: 1.25 })
            })
        );
        expect(storeSave).toHaveBeenCalledOnce();
    });

    it('propagates manual save failures', async () => {
        vi.useFakeTimers();
        const { loadUserSettings, saveUserSettingsManually } = await import('./userSettings');
        const settings = await loadUserSettings();
        storeSave.mockRejectedValueOnce(new Error('save failed'));

        settings.update((value) => ({
            ...value,
            base: {
                ...value.base,
                zoom: 1.5
            }
        }));

        await expect(saveUserSettingsManually(settings)).rejects.toThrow('save failed');
    });
});
