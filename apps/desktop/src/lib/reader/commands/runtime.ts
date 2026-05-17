import type { ContextKeyService } from '$lib/context-keys';
import { notebookStore } from '$lib/reader/stores/notebookStore';
import { readerCommandState } from '$lib/reader/stores/readerCommandState';
import { readerStore } from '$lib/reader/stores/readerStore';
import { sidebarStore } from '$lib/reader/stores/sidebarStore';
import { ReaderContextKey } from './contextKeys';

export type ReaderCommandRuntime = {
    closeSettings: (bookKey?: string) => void;
    getActiveBookKey: () => string | undefined;
    hasBook: (bookKey?: string) => boolean;
    hasSettingsOpen: (bookKey?: string) => boolean;
    nextPage: (bookKey: string) => void | Promise<void>;
    nextSection: (bookKey: string) => void | Promise<void>;
    openSearch: (bookKey: string) => void;
    openSettings: (bookKey: string) => void;
    previousPage: (bookKey: string) => void | Promise<void>;
    previousSection: (bookKey: string) => void | Promise<void>;
    toggleNotebook: (bookKey: string) => void;
    toggleSidebar: (bookKey: string) => void;
};

export function createReaderCommandRuntime(contextKeys: ContextKeyService): ReaderCommandRuntime {
    const getActiveBookKey = () => {
        const activeBookKey = contextKeys.get(ReaderContextKey.ActiveBookKey);
        return typeof activeBookKey === 'string' ? activeBookKey : undefined;
    };

    return {
        closeSettings: (bookKey?: string) => {
            if (bookKey) {
                readerCommandState.setSettingsOpen(bookKey, false);
            } else {
                readerCommandState.closeAllSettings();
            }
            readerStore.setHoveredBookKey(null);
        },
        getActiveBookKey,
        hasBook: (bookKey?: string) => Boolean(bookKey && readerStore.getView(bookKey)),
        hasSettingsOpen: (bookKey?: string) => {
            if (bookKey) return readerCommandState.isSettingsOpen(bookKey);
            return readerCommandState.isAnySettingsOpen();
        },
        nextPage: (bookKey: string) => readerStore.getView(bookKey)?.goRight?.(),
        nextSection: (bookKey: string) => readerStore.getView(bookKey)?.renderer?.nextSection?.(),
        openSearch: (bookKey: string) => {
            sidebarStore.setSideBarBookKey(bookKey);
            sidebarStore.setCurrentTab('search');
            sidebarStore.setVisible(true);
        },
        openSettings: (bookKey: string) => {
            readerStore.setHoveredBookKey('');
            readerCommandState.setSettingsOpen(bookKey, true);
        },
        previousPage: (bookKey: string) => readerStore.getView(bookKey)?.goLeft?.(),
        previousSection: (bookKey: string) =>
            readerStore.getView(bookKey)?.renderer?.prevSection?.(),
        toggleNotebook: (_bookKey: string) => {
            notebookStore.setVisible(!notebookStore.getVisible());
        },
        toggleSidebar: (bookKey: string) => {
            sidebarStore.setSideBarBookKey(bookKey);
            sidebarStore.toggle();
        }
    };
}
