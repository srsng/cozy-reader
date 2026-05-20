import type {
    CommandArgs,
    CommandDefinition,
    CommandPayload,
    CommandReference,
    CommandResult,
    CommandScope,
    KnownCommandId
} from '$lib/commands/types';
import type { MenuCategory, MenuContribution, MenuId } from '$lib/menus/types';
import type {
    KeyCombination,
    KeybindingSource,
    PlatformKeybindingMap,
    StaticKeybinding
} from '$lib/keybindings/types';
import type { ContextKeyExpression } from '$lib/context-keys';
import type { PlatformName } from '$lib/platform/types';
import type { Disposable } from '$lib/utils/disposable';

export type ActionMenuContribution = Omit<
    MenuContribution,
    'id' | 'invocation' | 'title' | 'category'
> & {
    id?: string;
    title?: string;
    category?: MenuCategory;
    payload?: CommandPayload;
    args?: CommandPayload[];
    toggled?: MenuContribution['toggled'];
};

export type ActionKeybindingContribution = {
    id?: string;
    name?: string;
    description?: string;
    combination: KeyCombination;
    platforms?: PlatformKeybindingMap;
    when?: string;
    allowInTextInput?: boolean;
    allowWhenDialogOpen?: boolean;
    allowWhenCommandPaletteOpen?: boolean;
    source?: KeybindingSource;
    payload?: CommandPayload;
    args?: CommandPayload[];
};

export type ActionDefinition<
    Args extends unknown[] = unknown[],
    Result = unknown,
    Id extends CommandReference = CommandReference
> = {
    id: Id;
    title: string;
    description?: string;
    category: MenuCategory;
    keywords?: readonly string[];
    requires?: ContextKeyExpression;
    command: Omit<CommandDefinition<Args, Result, Id>, 'id'>;
    menus?: readonly ActionMenuContribution[];
    keybindings?: readonly ActionKeybindingContribution[];
};

export type AnyActionDefinition = ActionDefinition<any[], any, CommandReference>;

export type KnownActionDefinition<Id extends KnownCommandId> = ActionDefinition<
    CommandArgs<Id>,
    CommandResult<Id>,
    Id
>;

export type RegisterActionServices = {
    commandScope?: CommandScope;
    platform?: PlatformName;
    commandService: {
        register(command: CommandDefinition<any[], any>): Disposable;
    };
    menuService: {
        register(contribution: MenuContribution): Disposable;
    };
    keybindingManager: {
        register(keybinding: StaticKeybinding): Disposable;
    };
};

export function defineAction<
    const Id extends CommandReference,
    Args extends unknown[] = unknown[],
    Result = unknown
>(action: ActionDefinition<Args, Result, Id>): ActionDefinition<Args, Result, Id> {
    return action;
}

export function defineKnownAction<const Id extends KnownCommandId>(
    action: KnownActionDefinition<Id>
): KnownActionDefinition<Id> {
    return action;
}

export function defineActions<const Actions extends readonly AnyActionDefinition[]>(
    actions: Actions
): Actions {
    return actions;
}
