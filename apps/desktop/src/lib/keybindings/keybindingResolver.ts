import { getCommandInvocationKey } from '$lib/commands/invocation';
import type { CommandInvocation, CommandReference } from '$lib/commands/types';
import { ContextKey, type ContextKeyService } from '$lib/context-keys';
import type { KeyCombination, KeybindingResolution, StaticKeybinding } from './types';
import { KeybindingUtils } from './keybindingListener';

export class KeybindingResolver {
    constructor(private readonly contextKeyService?: ContextKeyService) {}

    resolve(
        keybindings: Iterable<StaticKeybinding>,
        combination: KeyCombination
    ): StaticKeybinding | null {
        return this.inspect(keybindings, combination).matched;
    }

    inspect(
        keybindings: Iterable<StaticKeybinding>,
        combination: KeyCombination
    ): KeybindingResolution {
        const sameCombination = Array.from(keybindings).filter((keybinding) =>
            KeybindingUtils.combinationsEqual(combination, keybinding.combination)
        );
        const candidates = sameCombination.map((keybinding, index) => ({
            keybinding,
            whenMatched: this.matchesWhen(keybinding),
            sourcePriority: sourcePriority(keybinding),
            registrationOrder: registrationOrder(keybinding, index)
        }));
        const matches = candidates
            .filter((candidate) => candidate.whenMatched)
            .sort(
                (a, b) =>
                    b.sourcePriority - a.sourcePriority || b.registrationOrder - a.registrationOrder
            );
        const matched = matches[0]?.keybinding ?? null;

        return {
            combination,
            matched,
            candidates,
            skipped: candidates.filter((candidate) => !candidate.whenMatched),
            conflicts: matches.slice(1).map((candidate) => candidate.keybinding)
        };
    }

    getKeybindingsForCommand(
        keybindings: Iterable<StaticKeybinding>,
        commandId: CommandReference
    ): StaticKeybinding[] {
        return Array.from(keybindings)
            .map((keybinding, index) => ({
                keybinding,
                sourcePriority: sourcePriority(keybinding),
                registrationOrder: registrationOrder(keybinding, index)
            }))
            .filter((candidate) => candidate.keybinding.commandId === commandId)
            .sort(
                (a, b) =>
                    b.sourcePriority - a.sourcePriority || b.registrationOrder - a.registrationOrder
            )
            .map((candidate) => candidate.keybinding);
    }

    getKeybindingsForInvocation(
        keybindings: Iterable<StaticKeybinding>,
        invocation: CommandInvocation
    ): StaticKeybinding[] {
        const invocationKey = getCommandInvocationKey(invocation);
        return this.getKeybindingsForCommand(keybindings, invocation.commandId).filter(
            (keybinding) =>
                getCommandInvocationKey({
                    scope: keybinding.commandScope,
                    commandId: keybinding.commandId!,
                    payload: keybinding.payload,
                    args: keybinding.args
                }) === invocationKey
        );
    }

    private matchesWhen(keybinding: StaticKeybinding): boolean {
        if (!this.contextKeyService) {
            return !keybinding.when;
        }

        return this.contextKeyService.match(
            keybinding.when ?? `!${ContextKey.TextInputFocus} && !${ContextKey.DialogOpen}`
        );
    }
}

function registrationOrder(keybinding: StaticKeybinding, fallback: number): number {
    return keybinding.registrationOrder ?? fallback;
}

function sourcePriority(keybinding: StaticKeybinding): number {
    switch (keybinding.source) {
        case 'user':
            return 3;
        case 'feature':
            return 2;
        case 'default':
            return 1;
        case 'legacy':
        default:
            return 0;
    }
}
