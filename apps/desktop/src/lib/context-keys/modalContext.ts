import type { AppState } from '$lib/state/app-state';
import { setAppDialogOpen } from '$lib/stores/appState';
import type { Writable } from 'svelte/store';

const openModalCounts = new WeakMap<Writable<AppState>, number>();

export function retainDialogOpen(appState: Writable<AppState>): () => void {
    const nextCount = (openModalCounts.get(appState) ?? 0) + 1;
    openModalCounts.set(appState, nextCount);
    setDialogOpen(appState, true);

    return () => {
        const currentCount = openModalCounts.get(appState) ?? 0;
        const remainingCount = Math.max(0, currentCount - 1);

        if (remainingCount === 0) {
            openModalCounts.delete(appState);
        } else {
            openModalCounts.set(appState, remainingCount);
        }

        setDialogOpen(appState, remainingCount > 0);
    };
}

function setDialogOpen(appState: Writable<AppState>, open: boolean): void {
    setAppDialogOpen(appState, open);
}
