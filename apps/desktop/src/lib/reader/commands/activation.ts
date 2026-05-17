import type { ContextKeyService } from '$lib/context-keys';
import type { RegisterActionServices } from '$lib/actions/types';
import { CommandService, type CommandRouter } from '$lib/commands';
import { DisposableStore, toDisposable, type Disposable } from '$lib/utils/disposable';
import { notebookStore } from '$lib/reader/stores/notebookStore';
import { readerCommandState } from '$lib/reader/stores/readerCommandState';
import { readerStore } from '$lib/reader/stores/readerStore';
import { sidebarStore } from '$lib/reader/stores/sidebarStore';
import { READER_COMMAND_SCOPE, registerReaderActions } from './actions';
import { ReaderContextKey } from './contextKeys';
import { createReaderCommandRuntime } from './runtime';

export type ReaderCommandContributionHost = Omit<RegisterActionServices, 'commandService'> & {
    commandRouter: CommandRouter;
    contextKeys: ContextKeyService;
    createCommandServiceContext: () => ConstructorParameters<typeof CommandService>[0];
};

export function activateReaderCommands(host: ReaderCommandContributionHost): Disposable {
    const disposables = new DisposableStore();
    const runtime = createReaderCommandRuntime(host.contextKeys);
    const commandService = new CommandService(host.createCommandServiceContext());

    disposables.add(registerReaderContextSync(host.contextKeys));
    disposables.add(host.commandRouter.registerScope(READER_COMMAND_SCOPE, commandService));
    disposables.add(
        registerReaderActions(
            {
                commandScope: READER_COMMAND_SCOPE,
                commandService,
                keybindingManager: host.keybindingManager,
                menuService: host.menuService
            },
            runtime
        )
    );

    return disposables;
}

function registerReaderContextSync(contextKeys: ContextKeyService): Disposable {
    const disposables = new DisposableStore();

    const syncReaderContext = () => {
        const bookKeys = readerStore.getBookKeys();
        const activeBookKey = readerCommandState.getActiveBookKey();
        const nextActiveBookKey =
            activeBookKey && bookKeys.includes(activeBookKey) ? activeBookKey : bookKeys[0];

        if (nextActiveBookKey !== activeBookKey) {
            readerCommandState.setActiveBookKey(nextActiveBookKey);
        }

        contextKeys.set(ReaderContextKey.BookOpen, bookKeys.length > 0);
        contextKeys.set(ReaderContextKey.ActiveBookKey, nextActiveBookKey);
        contextKeys.set(ReaderContextKey.SidebarVisible, sidebarStore.getVisible());
        contextKeys.set(ReaderContextKey.NotebookVisible, notebookStore.getVisible());
        contextKeys.set(ReaderContextKey.SettingsOpen, readerCommandState.isAnySettingsOpen());
    };

    contextKeys.set(ReaderContextKey.BookOpen, false);
    contextKeys.set(ReaderContextKey.ActiveBookKey, undefined);
    contextKeys.set(ReaderContextKey.SidebarVisible, false);
    contextKeys.set(ReaderContextKey.NotebookVisible, false);
    contextKeys.set(ReaderContextKey.SettingsOpen, false);

    disposables.add(toDisposable(readerStore.subscribe(syncReaderContext)));
    disposables.add(toDisposable(sidebarStore.subscribe(syncReaderContext)));
    disposables.add(toDisposable(notebookStore.subscribe(syncReaderContext)));
    disposables.add(toDisposable(readerCommandState.subscribe(syncReaderContext)));
    syncReaderContext();

    disposables.add(
        toDisposable(() => {
            readerCommandState.setActiveBookKey(undefined);
            readerCommandState.closeAllSettings();
            contextKeys.set(ReaderContextKey.BookOpen, false);
            contextKeys.set(ReaderContextKey.ActiveBookKey, undefined);
            contextKeys.set(ReaderContextKey.SidebarVisible, false);
            contextKeys.set(ReaderContextKey.NotebookVisible, false);
            contextKeys.set(ReaderContextKey.SettingsOpen, false);
        })
    );

    return disposables;
}
