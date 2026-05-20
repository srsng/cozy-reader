import { retainDialogOpen } from '$lib/context-keys/modalContext';
import { APP_STATE } from '$lib/stores/appState';
import { injectOptional } from '$lib/utils/context';
import type { AppState } from '$lib/state/app-state';
import type { Writable } from 'svelte/store';

export function useDialogOpenContext(isOpen: () => boolean): void {
    const appState = injectOptional<Writable<AppState> | null>(APP_STATE, null);

    $effect(() => {
        if (!appState || !isOpen()) return;
        return retainDialogOpen(appState);
    });
}
