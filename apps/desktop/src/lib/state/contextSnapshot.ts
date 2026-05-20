import { ContextKey, type ContextKeyProjection, type ContextKeySnapshot } from '$lib/context-keys';
import type { ContextKeyService } from '$lib/context-keys';
import { createPlatformInfoContextSnapshot } from '$lib/platform/contextKeys';
import type { UserSettings } from '$lib/settings';
import type { Disposable } from '$lib/utils/disposable';
import type { Writable } from 'svelte/store';
import type { AppState } from './app-state';

export function createAppContextSnapshot(
    appState: AppState,
    userSettings: UserSettings
): ContextKeySnapshot {
    return {
        ...createPlatformInfoContextSnapshot(appState.platform),
        [ContextKey.CommandPaletteOpen]: appState.ui.commandPaletteOpen,
        [ContextKey.DialogOpen]: appState.ui.dialogOpen,
        [ContextKey.TextInputFocus]: appState.ui.textInputFocus,
        [ContextKey.ThemeEffects]: userSettings.theme.effects,
        [ContextKey.WindowAlwaysOnTop]: userSettings.base.alwaysOnTop,
        [ContextKey.WindowDevtoolsAvailable]: appState.window.devtoolsAvailable,
        [ContextKey.WindowFullscreen]: appState.window.fullscreen,
        [ContextKey.ThemeEffectBlurAvailable]: appState.theme.effectAvailability.blur,
        [ContextKey.ThemeEffectMicaAvailable]: appState.theme.effectAvailability.mica,
        [ContextKey.ThemeEffectAcrylicAvailable]: appState.theme.effectAvailability.acrylic
    };
}

export function createAppContextProjection(options: {
    getAppState: () => AppState;
    getUserSettings: () => UserSettings;
    subscribe: (emit: () => void) => () => void;
}): ContextKeyProjection {
    return {
        id: 'app',
        getSnapshot: () =>
            createAppContextSnapshot(options.getAppState(), options.getUserSettings()),
        subscribe: options.subscribe
    };
}

export function registerAppContextProjection(
    contextKeys: ContextKeyService,
    appState: Writable<AppState>,
    userSettings: Writable<UserSettings>
): Disposable {
    let currentAppState = getStoreValue(appState);
    let currentUserSettings = getStoreValue(userSettings);

    return contextKeys.registerProjection(
        createAppContextProjection({
            getAppState: () => currentAppState,
            getUserSettings: () => currentUserSettings,
            subscribe: (emit) => {
                const unlistenAppState = appState.subscribe((value) => {
                    currentAppState = value;
                    emit();
                });
                const unlistenUserSettings = userSettings.subscribe((value) => {
                    currentUserSettings = value;
                    emit();
                });

                return () => {
                    unlistenAppState();
                    unlistenUserSettings();
                };
            }
        })
    );
}

export function createRouteContextProjection(options: {
    getPath: () => string;
    subscribe: (emit: () => void) => () => void;
}): ContextKeyProjection {
    return {
        id: 'route',
        getSnapshot: () => ({
            [ContextKey.Route]: options.getPath()
        }),
        subscribe: options.subscribe
    };
}

function getStoreValue<T>(store: Writable<T>): T {
    let value: T | undefined;
    const unsubscribe = store.subscribe((currentValue) => {
        value = currentValue;
    });
    unsubscribe();
    return value as T;
}
