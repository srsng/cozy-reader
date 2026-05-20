import { describe, expect, it } from 'vitest';
import { writable } from 'svelte/store';
import { ContextKey, ContextKeyService } from '$lib/context-keys';
import { createTestSettings } from '$lib/testing';
import { createDefaultAppState, type AppState } from './app-state';
import { createRouteContextProjection, registerAppContextProjection } from './contextSnapshot';

describe('app context projection', () => {
    it('projects AppState and settings into context keys', () => {
        const contextKeys = new ContextKeyService();
        const initialAppState: AppState = {
            ...createDefaultAppState(),
            platform: {
                ...createDefaultAppState().platform,
                type: 'windows',
                name: 'windows',
                version: '10.0.22000'
            },
            ui: {
                commandPaletteOpen: true,
                dialogOpen: false,
                textInputFocus: true
            },
            window: {
                devtoolsAvailable: true,
                fullscreen: true
            },
            theme: {
                effectAvailability: {
                    acrylic: true,
                    blur: true,
                    mica: true
                }
            }
        };
        const appState = writable(initialAppState);
        const userSettings = writable(
            createTestSettings({
                base: { alwaysOnTop: true },
                theme: { effects: 'mica' }
            })
        );

        const disposable = registerAppContextProjection(contextKeys, appState, userSettings);

        expect(contextKeys.get(ContextKey.CommandPaletteOpen)).toBe(true);
        expect(contextKeys.get(ContextKey.TextInputFocus)).toBe(true);
        expect(contextKeys.get(ContextKey.WindowAlwaysOnTop)).toBe(true);
        expect(contextKeys.get(ContextKey.WindowFullscreen)).toBe(true);
        expect(contextKeys.get(ContextKey.ThemeEffects)).toBe('mica');
        expect(contextKeys.get(ContextKey.ThemeEffectMicaAvailable)).toBe(true);
        expect(contextKeys.get(ContextKey.IsWindows)).toBe(true);
        expect(contextKeys.get(ContextKey.PlatformName)).toBe('windows');
        expect(contextKeys.get(ContextKey.PlatformVersion)).toBe('10.0.22000');

        disposable.dispose();
    });

    it('updates projected keys when AppState or settings change', () => {
        const contextKeys = new ContextKeyService();
        const appState = writable(createDefaultAppState());
        const userSettings = writable(createTestSettings());
        registerAppContextProjection(contextKeys, appState, userSettings);

        appState.update((state) => ({
            ...state,
            ui: {
                ...state.ui,
                commandPaletteOpen: true
            }
        }));
        userSettings.update((settings) => ({
            ...settings,
            base: {
                ...settings.base,
                alwaysOnTop: true
            }
        }));

        expect(contextKeys.get(ContextKey.CommandPaletteOpen)).toBe(true);
        expect(contextKeys.get(ContextKey.WindowAlwaysOnTop)).toBe(true);
    });

    it('projects route context independently from AppState', () => {
        let currentPath = '/settings';
        let emitChange: (() => void) | undefined;
        const contextKeys = new ContextKeyService();
        contextKeys.registerProjection(
            createRouteContextProjection({
                getPath: () => currentPath,
                subscribe: (emit) => {
                    emitChange = emit;
                    return () => undefined;
                }
            })
        );

        expect(contextKeys.get(ContextKey.Route)).toBe('/settings');

        currentPath = '/reader';
        emitChange?.();

        expect(contextKeys.get(ContextKey.Route)).toBe('/reader');
    });
});
