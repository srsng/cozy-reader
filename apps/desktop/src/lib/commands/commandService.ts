import { InjectionToken } from '$lib/utils/context';
import { DisposableStore, toDisposable, type Disposable } from '$lib/utils/disposable';
import type {
    AnyCommandDefinition,
    CommandArgs,
    CommandContext,
    CommandInvocation,
    CommandReference,
    CommandResult,
    DynamicCommandId,
    KnownCommandId
} from './types';
import { getCommandInvocationArgs } from './invocation';
import { validateStandardSchemaSync } from './schema';

export const COMMAND_SERVICE_KEY_STR = 'CommandService' as const;
export const COMMAND_SERVICE = new InjectionToken<CommandService>(COMMAND_SERVICE_KEY_STR);

type CommandArgsValidation =
    | {
          ok: true;
          args: unknown[];
      }
    | {
          ok: false;
      };

export class CommandService {
    private readonly commands = new Map<string, AnyCommandDefinition>();

    constructor(private readonly context: CommandContext) {}

    register(command: AnyCommandDefinition): Disposable {
        if (this.commands.has(command.id)) {
            handleDuplicateRegistration(`Overwriting command: ${command.id}`);
        }
        this.commands.set(command.id, command);

        return toDisposable(() => {
            if (this.commands.get(command.id) === command) {
                this.commands.delete(command.id);
            }
        });
    }

    registerAll(commands: readonly AnyCommandDefinition[]): Disposable {
        const disposables = new DisposableStore();

        try {
            commands.forEach((command) => disposables.add(this.register(command)));
            return disposables;
        } catch (error) {
            disposables.dispose();
            throw error;
        }
    }

    getCommands(): AnyCommandDefinition[] {
        return Array.from(this.commands.values());
    }

    findCommand(invocation: CommandInvocation): AnyCommandDefinition | undefined;
    findCommand(id: CommandReference): AnyCommandDefinition | undefined;
    findCommand(
        invocationOrId: CommandInvocation | CommandReference
    ): AnyCommandDefinition | undefined {
        const id = typeof invocationOrId === 'string' ? invocationOrId : invocationOrId.commandId;
        return this.commands.get(id);
    }

    canExecute<Id extends KnownCommandId>(id: Id, ...args: CommandArgs<Id>): boolean;
    canExecute(id: DynamicCommandId, ...args: unknown[]): boolean;
    canExecute(id: KnownCommandId | DynamicCommandId, ...args: unknown[]): boolean {
        return this.canExecuteCommandWithArgs(id, args);
    }

    canExecuteInvocation(invocation: CommandInvocation): boolean {
        return this.canExecuteCommandWithArgs(
            invocation.commandId,
            getCommandInvocationArgs(invocation)
        );
    }

    async execute<Id extends KnownCommandId>(id: Id, ...args: CommandArgs<Id>): Promise<boolean>;
    async execute(id: DynamicCommandId, ...args: unknown[]): Promise<boolean>;
    async execute(id: KnownCommandId | DynamicCommandId, ...args: unknown[]): Promise<boolean> {
        return this.executeCommandWithArgs(id, args).then((result) => result.executed);
    }

    async executeCommand<Id extends KnownCommandId>(
        id: Id,
        ...args: CommandArgs<Id>
    ): Promise<CommandResult<Id> | undefined>;
    async executeCommand<T = unknown>(
        id: DynamicCommandId,
        ...args: unknown[]
    ): Promise<T | undefined>;
    async executeCommand<T = unknown>(
        id: KnownCommandId | DynamicCommandId,
        ...args: unknown[]
    ): Promise<T | undefined> {
        const result = await this.executeCommandWithArgs<T>(id, args);
        return result.value;
    }

    async executeInvocation(invocation: CommandInvocation): Promise<boolean> {
        const args = getCommandInvocationArgs(invocation);
        return this.executeCommandWithArgs(invocation.commandId, args).then(
            (result) => result.executed
        );
    }

    private async executeCommandWithArgs<T>(
        id: CommandReference,
        args: readonly unknown[]
    ): Promise<{ executed: boolean; value?: T }> {
        const command = this.commands.get(id);
        if (!command) {
            console.warn(`Missing command: ${id}`);
            return { executed: false };
        }

        if (!this.context.contextKeys.match(command.enablement)) {
            return { executed: false };
        }

        const validation = this.validateCommandArgs(command, args);
        if (!validation.ok) {
            return { executed: false };
        }

        if (command.canRun && !command.canRun(this.context, ...validation.args)) {
            return { executed: false };
        }

        const rawValue = await command.run(this.context, ...validation.args);
        const value = this.validateCommandResult(command, rawValue) as T;
        return { executed: true, value };
    }

    private canExecuteCommandWithArgs(id: CommandReference, args: readonly unknown[]): boolean {
        const command = this.commands.get(id);
        if (!command) return false;
        return this.canExecuteCommand(command, args);
    }

    private canExecuteCommand(command: AnyCommandDefinition, args: readonly unknown[]): boolean {
        if (!this.context.contextKeys.match(command.enablement)) return false;
        const validation = this.validateCommandArgs(command, args);
        if (!validation.ok) return false;
        if (command.canRun && !command.canRun(this.context, ...validation.args)) return false;
        return true;
    }

    private validateCommandArgs(
        command: AnyCommandDefinition,
        args: readonly unknown[]
    ): CommandArgsValidation {
        if (!command.argsSchema) {
            return {
                ok: true,
                args: Array.from(args)
            };
        }

        const validation = validateStandardSchemaSync(
            command.argsSchema,
            Array.from(args),
            `Command ${command.id} arguments`
        );

        if (!validation.ok) {
            return { ok: false };
        }

        return {
            ok: true,
            args: validation.value
        };
    }

    private validateCommandResult(command: AnyCommandDefinition, value: unknown): unknown {
        if (!command.resultSchema) return value;

        const validation = validateStandardSchemaSync(
            command.resultSchema,
            value,
            `Command ${command.id} result`
        );

        if (!validation.ok) {
            throw validation.error;
        }

        return validation.value;
    }
}

function handleDuplicateRegistration(message: string): void {
    if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
        throw new Error(message);
    }

    console.warn(message);
}
