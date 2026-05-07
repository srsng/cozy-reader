import { writable, type Writable } from 'svelte/store';
import { DEFAULT_APP_STATE, type AppState } from '$lib/state/app-state';
import { InjectionToken } from '$lib/utils/context';

export const APP_STATE_KEY_STR = 'app-state';
// app state context Key
export const APP_STATE = new InjectionToken<Writable<AppState>>(APP_STATE_KEY_STR);

export function initAppState(): Writable<AppState> {
    const store = writable<AppState>(DEFAULT_APP_STATE);

    return {
        subscribe: store.subscribe,
        set: store.set,
        update: store.update
    };
}

export function resetAppTitle(appState: Writable<AppState>) {
    appState.update((a) => {
        a.appTitle = DEFAULT_APP_STATE.appTitle;
        return a;
    });
}
