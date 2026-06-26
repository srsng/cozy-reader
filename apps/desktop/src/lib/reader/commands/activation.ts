import type { ContextKeyService, ContextKeySnapshot } from '$lib/context-keys';
import type { RegisterActionServices } from '$lib/actions/types';
import { CommandService } from '$lib/commands/commandService';
import type { CommandRouter } from '$lib/commands/commandRouter';
import type { Readable } from 'svelte/store';
import { DisposableStore, toDisposable, type Disposable } from '$lib/utils/disposable';
import { notebookStore } from '$lib/reader/stores/notebookStore';
import { readerCommandState } from '$lib/reader/stores/readerCommandState';
import { readerStore } from '$lib/reader/stores/readerStore';
import { sidebarStore } from '$lib/reader/stores/sidebarStore';
import type { ReaderSettings } from '$lib/reader/settings';
import type { ArrowKeyNavigationMode } from '$lib/reader/types';
import { READER_COMMAND_SCOPE, registerReaderActions } from './actions';
import { ReaderContextKey } from './contextKeys';
import { createReaderCommandRuntime } from './runtime';

export type ReaderCommandContributionHost = Omit<RegisterActionServices, 'commandService'> & {
    commandRouter: CommandRouter;
    contextKeys: ContextKeyService;
    createCommandServiceContext: () => ConstructorParameters<typeof CommandService>[0];
    readerSettings?: Readable<ReaderSettings>;
};

export function activateReaderCommands(host: ReaderCommandContributionHost): Disposable {
    const disposables = new DisposableStore();
    const runtime = createReaderCommandRuntime(host.contextKeys);
    const commandService = new CommandService(host.createCommandServiceContext());

    disposables.add(registerReaderContextSync(host.contextKeys, host.readerSettings));
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

function registerReaderContextSync(
    contextKeys: ContextKeyService,
    readerSettings?: Readable<ReaderSettings>
): Disposable {
    let arrowKeyNavigationMode: ArrowKeyNavigationMode = 'vertical-section-horizontal-page';
    const syncReaderContext = () => {
        const bookKeys = readerStore.getBookKeys();
        const activeBookKey = readerCommandState.getActiveBookKey();
        const nextActiveBookKey =
            activeBookKey && bookKeys.includes(activeBookKey) ? activeBookKey : bookKeys[0];

        if (nextActiveBookKey !== activeBookKey) {
            readerCommandState.setActiveBookKey(nextActiveBookKey);
        }
    };

    const projection = contextKeys.registerProjection({
        id: 'reader',
        getSnapshot: () => createReaderContextSnapshot(arrowKeyNavigationMode),
        subscribe: (emit) => {
            const disposables = new DisposableStore();
            let disposed = false;
            let initialized = false;
            let emitQueued = false;
            const queueEmit = () => {
                if (disposed || emitQueued) return;
                emitQueued = true;
                queueMicrotask(() => {
                    emitQueued = false;
                    if (!disposed) emit();
                });
            };
            const syncAndEmit = () => {
                syncReaderContext();
                if (initialized) queueEmit();
            };

            disposables.add(toDisposable(readerStore.subscribe(syncAndEmit)));
            disposables.add(toDisposable(sidebarStore.subscribe(syncAndEmit)));
            disposables.add(toDisposable(notebookStore.subscribe(syncAndEmit)));
            disposables.add(toDisposable(readerCommandState.subscribe(syncAndEmit)));
            if (readerSettings) {
                disposables.add(
                    toDisposable(
                        readerSettings.subscribe((settings) => {
                            arrowKeyNavigationMode =
                                settings.arrowKeyNavigationMode ??
                                'vertical-section-horizontal-page';
                            syncAndEmit();
                        })
                    )
                );
            }
            syncReaderContext();
            initialized = true;

            return () => {
                disposed = true;
                disposables.dispose();
            };
        }
    });

    return toDisposable(() => {
        projection.dispose();
        readerCommandState.setActiveBookKey(undefined);
        readerCommandState.closeAllSettings();
    });
}

function createReaderContextSnapshot(
    arrowKeyNavigationMode: ArrowKeyNavigationMode
): ContextKeySnapshot {
    const bookKeys = readerStore.getBookKeys();
    const activeBookKey = readerCommandState.getActiveBookKey();
    const nextActiveBookKey =
        activeBookKey && bookKeys.includes(activeBookKey) ? activeBookKey : bookKeys[0];

    return {
        [ReaderContextKey.BookOpen]: bookKeys.length > 0,
        [ReaderContextKey.ActiveBookKey]: nextActiveBookKey,
        [ReaderContextKey.ArrowKeyNavigationMode]: arrowKeyNavigationMode,
        [ReaderContextKey.SidebarVisible]: sidebarStore.getVisible(),
        [ReaderContextKey.NotebookVisible]: notebookStore.getVisible(),
        [ReaderContextKey.SettingsOpen]: readerCommandState.isAnySettingsOpen()
    };
}
