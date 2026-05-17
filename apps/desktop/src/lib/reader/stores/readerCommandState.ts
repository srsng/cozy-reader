import { get, writable, type Writable } from 'svelte/store';

type ReaderCommandState = {
    activeBookKey: string | undefined;
    settingsOpenByBookKey: Record<string, boolean>;
};

class ReaderCommandStateStore {
    private readonly store: Writable<ReaderCommandState>;

    constructor() {
        this.store = writable({
            activeBookKey: undefined,
            settingsOpenByBookKey: {}
        });
    }

    subscribe(callback: (state: ReaderCommandState) => void): () => void {
        return this.store.subscribe(callback);
    }

    setActiveBookKey(bookKey: string | undefined): void {
        this.store.update((state) => {
            if (state.activeBookKey === bookKey) return state;

            return {
                ...state,
                activeBookKey: bookKey
            };
        });
    }

    getActiveBookKey(): string | undefined {
        return get(this.store).activeBookKey;
    }

    setSettingsOpen(bookKey: string, open: boolean): void {
        this.store.update((state) => {
            if (Boolean(state.settingsOpenByBookKey[bookKey]) === open) return state;

            return {
                ...state,
                settingsOpenByBookKey: {
                    ...state.settingsOpenByBookKey,
                    [bookKey]: open
                }
            };
        });
    }

    closeAllSettings(): void {
        this.store.update((state) => {
            if (!Object.values(state.settingsOpenByBookKey).some(Boolean)) return state;

            return {
                ...state,
                settingsOpenByBookKey: {}
            };
        });
    }

    isSettingsOpen(bookKey: string): boolean {
        return Boolean(get(this.store).settingsOpenByBookKey[bookKey]);
    }

    isAnySettingsOpen(): boolean {
        return Object.values(get(this.store).settingsOpenByBookKey).some(Boolean);
    }
}

export const readerCommandState = new ReaderCommandStateStore();
