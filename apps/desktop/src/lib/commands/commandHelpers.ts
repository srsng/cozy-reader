import type { UserSettings } from '$lib/settings';
import type { Writable } from 'svelte/store';
import type { CommandContext } from './types';

export const MIN_ZOOM = 0.375;
export const MAX_ZOOM = 4;
export const DEFAULT_ZOOM = 1;
export const ZOOM_STEP = 0.0625;

export function getStoreValue<T>(store: Writable<T>): T {
    let value: T | undefined;
    const unsubscribe = store.subscribe((currentValue) => {
        value = currentValue;
    });
    unsubscribe();
    return value as T;
}

export function updateStore<T>(store: Writable<T>, mutator: (draft: T) => void): void {
    store.update((currentValue) => {
        const nextValue = structuredClone(currentValue);
        mutator(nextValue);
        return nextValue;
    });
}

export function updateSettings(
    context: CommandContext,
    mutator: (settings: UserSettings) => void
): void {
    updateStore(context.userSettings, mutator);
}

export function clampZoom(value: number): number {
    return Math.min(Math.max(value, MIN_ZOOM), MAX_ZOOM);
}

export function setDomZoom(value: number): void {
    if (typeof document === 'undefined') return;
    document.documentElement.style.fontSize = `${value}rem`;
}

export function setZoom(context: CommandContext, value: number): void {
    const zoom = clampZoom(value);
    setDomZoom(zoom);
    updateSettings(context, (settings) => {
        settings.base.zoom = zoom;
    });
}

export async function setAlwaysOnTop(context: CommandContext, value: boolean): Promise<void> {
    await context.window.setAlwaysOnTop(value);
    updateSettings(context, (settings) => {
        settings.base.alwaysOnTop = value;
    });
}

export async function toggleFullscreen(context: CommandContext): Promise<void> {
    await context.window.toggleFullscreen();
    await context.window.saveState();
}
