import { describe, expect, it } from 'vitest';
import { getStoreValue } from '$lib/testing';
import { createDefaultAppState } from '$lib/state/app-state';
import {
    initAppState,
    setAppCommandPaletteOpen,
    setAppDialogOpen,
    setAppTextInputFocus,
    setAppWindowFullscreen,
    toggleAppCommandPaletteOpen
} from './appState';

describe('AppState store', () => {
    it('clones the initial state when creating a store', () => {
        const initialState = createDefaultAppState();
        const appState = initAppState(initialState);

        setAppCommandPaletteOpen(appState, true);

        expect(initialState.ui.commandPaletteOpen).toBe(false);
        expect(getStoreValue(appState).ui.commandPaletteOpen).toBe(true);
    });

    it('updates common runtime fields through narrow helpers', () => {
        const appState = initAppState();

        setAppCommandPaletteOpen(appState, true);
        toggleAppCommandPaletteOpen(appState);
        setAppDialogOpen(appState, true);
        setAppTextInputFocus(appState, true);
        setAppWindowFullscreen(appState, true);

        expect(getStoreValue(appState)).toMatchObject({
            ui: {
                commandPaletteOpen: false,
                dialogOpen: true,
                textInputFocus: true
            },
            window: {
                fullscreen: true
            }
        });
    });

    it('does not notify subscribers when text input focus is unchanged', () => {
        const appState = initAppState();
        let notificationCount = 0;
        const unsubscribe = appState.subscribe(() => {
            notificationCount += 1;
        });

        setAppTextInputFocus(appState, false);
        expect(notificationCount).toBe(1);

        setAppTextInputFocus(appState, true);
        expect(notificationCount).toBe(2);

        unsubscribe();
    });
});
