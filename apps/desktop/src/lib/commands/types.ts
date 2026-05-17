import type { UserSettings } from '$lib/settings';
import type { AppThemeEffects } from '$lib/settings/Theme';
import type { AppState } from '$lib/state/app-state';
import type { SettingsTab } from '$lib/utils/route.svelte';
import type { Writable } from 'svelte/store';
import type { ContextKeyService } from '$lib/context-keys';
import type { StandardSchemaV1 } from '@standard-schema/spec';

export interface CommandRegistry {}

export type CommandSpec<Args extends unknown[] = unknown[], Result = unknown> = {
    args: Args;
    result: Result;
};

export type KnownCommandId = Extract<keyof CommandRegistry, string>;

declare const dynamicCommandIdBrand: unique symbol;

export type DynamicCommandId = string & {
    readonly [dynamicCommandIdBrand]: true;
};

export type CommandId = KnownCommandId | DynamicCommandId;
export type CommandReference = string;
export type CommandScope = string;

export const DEFAULT_COMMAND_SCOPE = 'app' as const satisfies CommandScope;

export type CommandArgs<Id extends CommandId> = Id extends KnownCommandId
    ? CommandRegistry[Id] extends CommandSpec<infer Args, unknown>
        ? Args
        : never
    : unknown[];

export type CommandResult<Id extends CommandId> = Id extends KnownCommandId
    ? CommandRegistry[Id] extends CommandSpec<unknown[], infer Result>
        ? Result
        : never
    : unknown;

export type CommandDefinitionFor<Id extends CommandId> = CommandDefinition<
    CommandArgs<Id>,
    CommandResult<Id>,
    Id
>;

export type KnownCommandDefinition<Id extends KnownCommandId> = CommandDefinition<
    CommandArgs<Id>,
    CommandResult<Id>,
    Id
>;

export function asDynamicCommandId(id: string): DynamicCommandId {
    return id as DynamicCommandId;
}

export type CommandPayload =
    | boolean
    | number
    | string
    | null
    | undefined
    | CommandPayload[]
    | { [key: string]: CommandPayload };

export type CommandInvocation = {
    scope?: CommandScope;
    commandId: CommandReference;
    payload?: CommandPayload;
    args?: CommandPayload[];
};

export type WindowCommandActions = {
    close: () => void | Promise<void>;
    maximize: () => void | Promise<void>;
    minimize: () => void | Promise<void>;
    refresh: () => void | Promise<void>;
    requestUserAttention: () => void | Promise<void>;
    restoreState: () => void | Promise<void>;
    saveState: () => void | Promise<void>;
    setAlwaysOnTop: (value: boolean) => void | Promise<void>;
    toggleDevtools: () => void | Promise<void>;
    toggleFullscreen: () => void | Promise<void>;
};

export type ThemeCommandActions = {
    setEffect: (effect: AppThemeEffects) => void | Promise<void>;
};

export type NavigationCommandActions = {
    settings: (tab?: SettingsTab) => void;
};

export type CommandContext = {
    appState: Writable<AppState>;
    contextKeys: ContextKeyService;
    navigation: NavigationCommandActions;
    theme: ThemeCommandActions;
    userSettings: Writable<UserSettings>;
    window: WindowCommandActions;
};

export type CommandDefinition<
    Args extends unknown[] = unknown[],
    Result = unknown,
    Id extends CommandReference = CommandReference
> = {
    id: Id;
    enablement?: string;
    argsSchema?: StandardSchemaV1<unknown, Args>;
    resultSchema?: StandardSchemaV1<unknown, Result>;
    canRun?: (context: CommandContext, ...args: Args) => boolean;
    run: (context: CommandContext, ...args: Args) => Result | Promise<Result>;
};

export type AnyCommandDefinition = CommandDefinition<any[], any, CommandReference>;

export function defineCommand<
    const Id extends CommandReference,
    Args extends unknown[] = unknown[],
    Result = unknown
>(command: CommandDefinition<Args, Result, Id>): CommandDefinition<Args, Result, Id> {
    return command;
}

export function defineKnownCommand<const Id extends KnownCommandId>(
    command: KnownCommandDefinition<Id>
): KnownCommandDefinition<Id> {
    return command;
}

export function defineCommands<const Commands extends readonly AnyCommandDefinition[]>(
    commands: Commands
): Commands {
    return commands;
}
