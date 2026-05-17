import type { CommandInvocation, CommandPayload } from './types';
import { DEFAULT_COMMAND_SCOPE } from './types';

export function getCommandInvocationKey(invocation: CommandInvocation): string {
    const scope = invocation.scope ?? DEFAULT_COMMAND_SCOPE;
    const commandKey =
        scope === DEFAULT_COMMAND_SCOPE ? invocation.commandId : `${scope}/${invocation.commandId}`;
    const args = getCommandInvocationArgs(invocation);
    if (args.length === 0) return commandKey;
    if (args.length === 1) return `${commandKey}:${stableStringify(args[0])}`;
    return `${commandKey}:${stableStringify(args)}`;
}

export function getCommandInvocationArgs(invocation: CommandInvocation): CommandPayload[] {
    if (invocation.args) return invocation.args;
    if (invocation.payload !== undefined) return [invocation.payload];
    return [];
}

function stableStringify(value: CommandPayload): string {
    if (value === undefined) return 'undefined';
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;

    const entries = Object.entries(value).sort(([left], [right]) => left.localeCompare(right));
    return `{${entries
        .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`)
        .join(',')}}`;
}
