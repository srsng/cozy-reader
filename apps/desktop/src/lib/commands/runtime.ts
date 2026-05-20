import { canGoBack, goBack, goBgSettings, goHome, goSettings } from '$lib/utils/route.svelte';
import { saveUserSettingsManually } from '$lib/stores/userSettings';
import type { UserSettings } from '$lib/settings';
import type { AppState } from '$lib/state/app-state';
import type { Writable } from 'svelte/store';
import type { CommandContext } from './types';
import type { ContextKeyService } from '$lib/context-keys';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { UserAttentionType, Window } from '@tauri-apps/api/window';
import { restoreStateCurrent, saveWindowState, StateFlags } from '@tauri-apps/plugin-window-state';
import { toEffects, type AppThemeEffects } from '$lib/settings/Theme';
import { openMainWindowDevtools } from '$lib/apis/devtools';

type CreateDefaultCommandContextOptions = {
    appState: Writable<AppState>;
    contextKeys: ContextKeyService;
    userSettings: Writable<UserSettings>;
};

async function restoreAppWindowState() {
    return restoreStateCurrent(StateFlags.ALL);
}

async function saveAppWindowState() {
    return saveWindowState(StateFlags.ALL);
}

export function createDefaultCommandContext({
    appState,
    contextKeys,
    userSettings
}: CreateDefaultCommandContextOptions): CommandContext {
    const appWindow = new Window('main');
    const webviewWindow = getCurrentWebviewWindow();

    return {
        appState,
        contextKeys,
        navigation: {
            back: goBack,
            backgroundSettings: goBgSettings,
            canGoBack,
            home: goHome,
            settings: goSettings
        },
        theme: {
            setEffect: async (effect: AppThemeEffects) => {
                await webviewWindow.clearEffects();
                if (effect === 'none') return;
                await webviewWindow.setEffects({ effects: toEffects[effect] });
            }
        },
        userSettings,
        window: {
            close: () => appWindow.close(),
            maximize: () => appWindow.toggleMaximize(),
            minimize: () => appWindow.minimize(),
            refresh: async () => {
                await saveUserSettingsManually(userSettings);
                await saveAppWindowState();
                window.location.reload();
            },
            requestUserAttention: () =>
                appWindow.requestUserAttention(UserAttentionType.Informational),
            restoreState: restoreAppWindowState,
            saveState: saveAppWindowState,
            setAlwaysOnTop: (value: boolean) => appWindow.setAlwaysOnTop(value),
            toggleDevtools: openMainWindowDevtools,
            toggleFullscreen: async () => {
                if (document.fullscreenElement) {
                    await document.exitFullscreen();
                    return;
                }

                await document.documentElement.requestFullscreen();
            }
        }
    };
}
