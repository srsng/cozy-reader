import type { Writable } from 'svelte/store';
import { registerDefaultActions } from '$lib/actions';
import { ContextKeyService } from '$lib/context-keys';
import { keybindingManager } from '$lib/keybindings/keybindingManager';
import { MenuService } from '$lib/menus';
import type { UserSettings } from '$lib/settings';
import type { AppState } from '$lib/state/app-state';
import { registerAppContextProjection } from '$lib/state/contextSnapshot';
import { DisposableStore } from '$lib/utils/disposable';
import { CommandRouter } from './commandRouter';
import { CommandService } from './commandService';
import { registerDefaultCommands } from './defaultCommands';
import { createDefaultCommandContext } from './runtime';

type CreateAppServicesOptions = {
    appState: Writable<AppState>;
    userSettings: Writable<UserSettings>;
};

export type AppServices = {
    contextKeys: ContextKeyService;
    commandService: CommandService;
    commandRouter: CommandRouter;
    menuService: MenuService;
    dispose: () => void;
};

export function createAppServices({
    appState,
    userSettings
}: CreateAppServicesOptions): AppServices {
    const disposables = new DisposableStore();
    const contextKeys = new ContextKeyService();

    disposables.add(registerAppContextProjection(contextKeys, appState, userSettings));

    // commandService
    const commandService = new CommandService(
        createDefaultCommandContext({
            appState,
            contextKeys,
            userSettings
        })
    );
    const commandRouter = new CommandRouter();

    disposables.add(commandRouter.registerScope('app', commandService));
    disposables.add(registerDefaultCommands(commandService));

    // menuService
    const menuService = new MenuService(commandRouter, contextKeys);

    // keybindingManager
    disposables.add(keybindingManager.setContextKeyService(contextKeys));
    disposables.add(keybindingManager.setCommandExecutor(commandRouter));
    const initialAppState = getStoreValue(appState);
    disposables.add(
        registerDefaultActions({
            commandService,
            menuService,
            keybindingManager,
            platform: initialAppState.platform.name
        })
    );

    return {
        contextKeys,
        commandService,
        commandRouter,
        menuService,
        dispose: () => disposables.dispose()
    };
}

function getStoreValue<T>(store: Writable<T>): T {
    let value: T | undefined;
    const unsubscribe = store.subscribe((currentValue) => {
        value = currentValue;
    });
    unsubscribe();
    return value as T;
}
