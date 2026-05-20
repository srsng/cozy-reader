<script lang="ts" module>
    import { onMount } from 'svelte';
    import { Window } from '@tauri-apps/api/window';
    import {
        restoreStateCurrent,
        saveWindowState,
        StateFlags
    } from '@tauri-apps/plugin-window-state';
    import {
        APP_STATE,
        setAppWindowDevtoolsAvailable,
        setAppWindowFullscreen
    } from '$lib/stores/appState';
    import { USER_SETTINGS } from '$lib/stores/userSettings';
    import { inject } from '$lib/utils/context';
    import { devtoolsAvailable } from '$lib/apis/devtools';

    async function restoreAppWindowState() {
        return restoreStateCurrent(StateFlags.ALL);
    }

    async function saveAppWindowState() {
        return saveWindowState(StateFlags.ALL);
    }
</script>

<script lang="ts">
    const userSettings = inject(USER_SETTINGS);
    const appState = inject(APP_STATE);
    const appWindow = new Window('main');

    function syncFullscreenContext() {
        const fullscreen = Boolean(document.fullscreenElement);
        setAppWindowFullscreen(appState, fullscreen);
    }

    onMount(() => {
        let disposed = false;
        let unlistenCloseRequested: (() => void) | undefined;

        void restoreAppWindowState();
        void appWindow.setAlwaysOnTop($userSettings.base.alwaysOnTop);
        void devtoolsAvailable()
            .then((canOpenDevtools) => {
                setAppWindowDevtoolsAvailable(appState, canOpenDevtools);
            })
            .catch((error) => {
                console.error('Failed to detect devtools availability:', error);
                setAppWindowDevtoolsAvailable(appState, false);
            });
        syncFullscreenContext();
        document.addEventListener('fullscreenchange', syncFullscreenContext);

        appWindow
            .listen('close-requested', async () => {
                await saveAppWindowState();
                await appWindow.close();
            })
            .then((unlisten) => {
                if (disposed) {
                    unlisten();
                    return;
                }

                unlistenCloseRequested = unlisten;
            })
            .catch((error) => {
                console.error('Failed to register window close listener:', error);
            });

        return () => {
            disposed = true;
            document.removeEventListener('fullscreenchange', syncFullscreenContext);
            unlistenCloseRequested?.();
        };
    });
</script>
