import type { MenuContribution } from '$lib/menus/types';
import type { StaticKeybinding } from '$lib/keybindings/types';
import { resolveKeybindingWhen as resolveGuardedKeybindingWhen } from '$lib/keybindings/contextGuards';
import { DisposableStore, type Disposable } from '$lib/utils/disposable';
import type {
    ActionKeybindingContribution,
    AnyActionDefinition,
    RegisterActionServices
} from './types';

export function registerAction(
    action: AnyActionDefinition,
    { commandService, commandScope, menuService, keybindingManager }: RegisterActionServices
): Disposable {
    const disposables = new DisposableStore();

    try {
        disposables.add(
            commandService.register({
                id: action.id,
                ...action.command
            })
        );

        action.menus?.forEach((menu) => {
            const contribution: MenuContribution = {
                id: menu.id ?? action.id,
                menu: menu.menu,
                title: menu.title ?? action.title,
                description: menu.description ?? action.description,
                category: menu.category ?? action.category,
                keywords: menu.keywords ?? action.keywords,
                defaultShortcut: menu.defaultShortcut,
                when: menu.when,
                enablement: menu.enablement ?? action.command.enablement,
                keepOpen: menu.keepOpen,
                order: menu.order,
                source: menu.source,
                toggled: menu.toggled,
                invocation: {
                    scope: commandScope,
                    commandId: action.id,
                    payload: menu.payload,
                    args: menu.args
                }
            };
            disposables.add(menuService.register(contribution));
        });

        action.keybindings?.forEach((keybinding) => {
            const contribution: StaticKeybinding = {
                id: keybinding.id ?? action.id,
                name: keybinding.name ?? action.title,
                description: keybinding.description ?? action.description ?? action.title,
                combination: keybinding.combination,
                when: resolveKeybindingWhen(keybinding, action.command.enablement),
                source: keybinding.source ?? 'default',
                commandScope,
                commandId: action.id,
                payload: keybinding.payload,
                args: keybinding.args
            };
            disposables.add(keybindingManager.register(contribution));
        });

        return disposables;
    } catch (error) {
        disposables.dispose();
        throw error;
    }
}

export function registerActions(
    actions: readonly AnyActionDefinition[],
    services: RegisterActionServices
): Disposable {
    const disposables = new DisposableStore();
    try {
        actions.forEach((action) => disposables.add(registerAction(action, services)));
        return disposables;
    } catch (error) {
        disposables.dispose();
        throw error;
    }
}

function resolveKeybindingWhen(
    keybinding: ActionKeybindingContribution,
    commandEnablement: string | undefined
): string {
    return resolveGuardedKeybindingWhen(keybinding.when ?? commandEnablement, {
        allowInTextInput: keybinding.allowInTextInput,
        allowWhenDialogOpen: keybinding.allowWhenDialogOpen
    });
}
