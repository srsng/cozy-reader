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
});
