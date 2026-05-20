import type { MenuContribution } from '$lib/menus/types';
import type { KeyCombination, StaticKeybinding } from '$lib/keybindings/types';
import { resolveKeybindingWhen as resolveGuardedKeybindingWhen } from '$lib/keybindings/contextGuards';
import { DisposableStore, type Disposable } from '$lib/utils/disposable';
import type {
    ActionKeybindingContribution,
    AnyActionDefinition,
    RegisterActionServices
} from './types';
import type { ContextKeyExpression } from '$lib/context-keys';
import { DEFAULT_PLATFORM_INFO, type PlatformName } from '$lib/platform/types';

export function registerAction(
    action: AnyActionDefinition,
    { commandService, commandScope, platform, menuService, keybindingManager }: RegisterActionServices
): Disposable {
    const disposables = new DisposableStore();
    const commandEnablement = combineContextExpressions(
        action.requires,
        action.command.enablement
    );

    try {
        disposables.add(
            commandService.register({
                id: action.id,
                ...action.command,
                enablement: commandEnablement
            })
        );

        action.menus?.forEach((menu) => {
            const menuEnablement = combineContextExpressions(
                action.requires,
                menu.enablement ?? commandEnablement
            );
            const contribution: MenuContribution = {
                id: menu.id ?? action.id,
                menu: menu.menu,
                title: menu.title ?? action.title,
                description: menu.description ?? action.description,
                category: menu.category ?? action.category,
                keywords: menu.keywords ?? action.keywords,
                defaultShortcut: menu.defaultShortcut,
                when: combineContextExpressions(action.requires, menu.when),
                enablement: menuEnablement,
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
            const combination = resolvePlatformKeybinding(
                keybinding,
                platform ?? DEFAULT_PLATFORM_INFO.name
            );
            if (!combination) return;

            const contribution: StaticKeybinding = {
                id: keybinding.id ?? action.id,
                name: keybinding.name ?? action.title,
                description: keybinding.description ?? action.description ?? action.title,
                combination,
                when: resolveKeybindingWhen(keybinding, commandEnablement),
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
    return resolveGuardedKeybindingWhen(combineContextExpressions(commandEnablement, keybinding.when), {
        allowInTextInput: keybinding.allowInTextInput,
        allowWhenDialogOpen: keybinding.allowWhenDialogOpen,
        allowWhenCommandPaletteOpen: keybinding.allowWhenCommandPaletteOpen
    });
}

function resolvePlatformKeybinding(
    keybinding: ActionKeybindingContribution,
    platform: PlatformName | undefined
): KeyCombination | null {
    if (!platform || !keybinding.platforms || !(platform in keybinding.platforms)) {
        return keybinding.combination;
    }

    const platformCombination = keybinding.platforms[platform];
    if (platformCombination === false) return null;
    return platformCombination ?? keybinding.combination;
}

function combineContextExpressions(
    ...expressions: readonly ContextKeyExpression[]
): ContextKeyExpression {
    const parts = expressions
        .filter((expression): expression is string => Boolean(expression?.trim()))
        .map((expression) => `(${expression})`);

    if (parts.length === 0) return undefined;
    return parts.join(' && ');
}
