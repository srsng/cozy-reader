import { InjectionToken } from '$lib/utils/context';
import { toDisposable, type Disposable } from '$lib/utils/disposable';
import type {
    AnyCommandDefinition,
    CommandInvocation,
    CommandReference,
    CommandScope
} from './types';
import { DEFAULT_COMMAND_SCOPE } from './types';

export const COMMAND_ROUTER = new InjectionToken<CommandRouter>('CommandRouter');

export type CommandRouteTarget = {
    findCommand(id: CommandReference): AnyCommandDefinition | undefined;
    canExecuteInvocation(invocation: CommandInvocation): boolean;
    executeInvocation(invocation: CommandInvocation): Promise<boolean>;
};

export class CommandRouter {
    private readonly scopes = new Map<CommandScope, CommandRouteTarget>();

    registerScope(scope: CommandScope, commandService: CommandRouteTarget): Disposable {
        if (this.scopes.has(scope)) {
            handleDuplicateRegistration(`Overwriting command scope: ${scope}`);
        }

        this.scopes.set(scope, commandService);

        return toDisposable(() => {
            if (this.scopes.get(scope) === commandService) {
                this.scopes.delete(scope);
            }
        });
    }

    findCommand(invocation: CommandInvocation): AnyCommandDefinition | undefined;
    findCommand(id: CommandReference): AnyCommandDefinition | undefined;
    findCommand(
        invocationOrId: CommandInvocation | CommandReference
    ): AnyCommandDefinition | undefined {
        const invocation =
            typeof invocationOrId === 'string' ? { commandId: invocationOrId } : invocationOrId;
        return this.getScopeService(invocation)?.findCommand(invocation.commandId);
    }

    canExecute(invocation: CommandInvocation): boolean {
        return this.canExecuteInvocation(invocation);
    }

    canExecuteInvocation(invocation: CommandInvocation): boolean {
        return this.getScopeService(invocation)?.canExecuteInvocation(invocation) ?? false;
    }

    execute(invocation: CommandInvocation): Promise<boolean> {
        return this.executeInvocation(invocation);
    }

    async executeInvocation(invocation: CommandInvocation): Promise<boolean> {
        const commandService = this.getScopeService(invocation);
        if (!commandService) {
            console.warn(`Missing command scope: ${scopeOf(invocation)}`);
            return false;
        }

        return commandService.executeInvocation(invocation);
    }

    private getScopeService(invocation: CommandInvocation): CommandRouteTarget | undefined {
        return this.scopes.get(scopeOf(invocation));
    }
}

export function scopeOf(invocation: CommandInvocation): CommandScope {
    return invocation.scope ?? DEFAULT_COMMAND_SCOPE;
}

function handleDuplicateRegistration(message: string): void {
    if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
        throw new Error(message);
    }

    console.warn(message);
}
