import { invoke } from '$lib/backend/ipc';

export function devtoolsAvailable(): Promise<boolean> {
    return invoke<boolean>('devtools_available');
}

export function openMainWindowDevtools(): Promise<void> {
    return invoke<void>('open_main_window_devtools');
}
