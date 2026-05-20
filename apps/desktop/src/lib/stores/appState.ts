import { writable, type Writable } from 'svelte/store';
import {
    createDefaultAppState,
    DEFAULT_APP_STATE,
    type AppState,
    type ThemeEffectAvailability
} from '$lib/state/app-state';
import { InjectionToken } from '$lib/utils/context';

export const APP_STATE_KEY_STR = 'app-state';
export const APP_STATE = new InjectionToken<Writable<AppState>>(APP_STATE_KEY_STR);

export function initAppState(initialState: AppState = createDefaultAppState()): Writable<AppState> {
    return writable<AppState>(structuredClone(initialState));
}

export function resetAppTitle(appState: Writable<AppState>): void {
    appState.update((state) => ({
        ...state,
        appTitle: DEFAULT_APP_STATE.appTitle
    }));
}

export function setAppTextInputFocus(appState: Writable<AppState>, focused: boolean): void {
    appState.update((state) => ({
        ...state,
        ui: {
            ...state.ui,
            textInputFocus: focused
        }
    }));
}

export function setAppCommandPaletteOpen(appState: Writable<AppState>, open: boolean): void {
    appState.update((state) => ({
        ...state,
        ui: {
            ...state.ui,
            commandPaletteOpen: open
        }
    }));
}

export function toggleAppCommandPaletteOpen(appState: Writable<AppState>): void {
    appState.update((state) => ({
        ...state,
        ui: {
            ...state.ui,
            commandPaletteOpen: !state.ui.commandPaletteOpen
        }
    }));
}

export function setAppDialogOpen(appState: Writable<AppState>, open: boolean): void {
    appState.update((state) => ({
        ...state,
        ui: {
            ...state.ui,
            dialogOpen: open
        }
    }));
}

export function setAppWindowFullscreen(appState: Writable<AppState>, fullscreen: boolean): void {
    appState.update((state) => ({
        ...state,
        window: {
            ...state.window,
            fullscreen
        }
    }));
}

export function setAppWindowDevtoolsAvailable(
    appState: Writable<AppState>,
    devtoolsAvailable: boolean
): void {
    appState.update((state) => ({
        ...state,
        window: {
            ...state.window,
            devtoolsAvailable
        }
    }));
}

/**
 * Test-only helper for overriding startup-derived theme effect availability.
 * Runtime code should derive this in createInitialAppStateSnapshot().
 *
 * @internal
 */
export function setAppThemeEffectAvailabilityForTest(
    appState: Writable<AppState>,
    effectAvailability: ThemeEffectAvailability
): void {
    appState.update((state) => ({
        ...state,
        theme: {
            ...state.theme,
            effectAvailability
        }
    }));
}
