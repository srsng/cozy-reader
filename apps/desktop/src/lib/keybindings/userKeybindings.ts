import type { CommandPayload, CommandReference } from '$lib/commands/types';
import { resolveKeybindingWhen } from './contextGuards';
import { KeybindingUtils } from './keybindingListener';
import type { StaticKeybinding, UserKeybindingRule } from './types';

export function parseUserKeybindingRules(value: unknown): UserKeybindingRule[] {
    if (!Array.isArray(value)) return [];

    return value
        .map(parseUserKeybindingRule)
        .filter((rule): rule is UserKeybindingRule => Boolean(rule));
}

export function userKeybindingRuleToStaticKeybinding(
    rule: UserKeybindingRule,
    fallback?: StaticKeybinding
): StaticKeybinding | undefined {
    if ('disabled' in rule && rule.disabled) return undefined;

    const combination = KeybindingUtils.stringToCombination(rule.key);
    if (!combination) return undefined;

    return {
        id: rule.id,
        name: fallback?.name ?? rule.id,
        description: fallback?.description ?? rule.commandId,
        combination,
        when: resolveKeybindingWhen(rule.when ?? fallback?.when, {
            allowInTextInput: rule.allowInTextInput,
            allowWhenDialogOpen: rule.allowWhenDialogOpen
        }),
        source: 'user',
        commandScope: rule.commandScope ?? fallback?.commandScope,
        commandId: rule.commandId,
        payload: rule.payload,
        args: rule.args
    };
}

function parseUserKeybindingRule(value: unknown): UserKeybindingRule | undefined {
    if (!value || typeof value !== 'object') return undefined;

    const record = value as Record<string, unknown>;
    if (typeof record.id !== 'string' || record.id.trim() === '') return undefined;

    if (record.disabled === true) {
        return {
            id: record.id,
            disabled: true
        };
    }

    if (typeof record.commandId !== 'string') return undefined;
    if (typeof record.key !== 'string') return undefined;
    if (!KeybindingUtils.stringToCombination(record.key)) return undefined;

    const rule: UserKeybindingRule = {
        id: record.id,
        commandScope: typeof record.commandScope === 'string' ? record.commandScope : undefined,
        commandId: record.commandId as CommandReference,
        key: record.key
    };

    if (typeof record.when === 'string') {
        rule.when = record.when;
    }

    if (typeof record.allowInTextInput === 'boolean') {
        rule.allowInTextInput = record.allowInTextInput;
    }

    if (typeof record.allowWhenDialogOpen === 'boolean') {
        rule.allowWhenDialogOpen = record.allowWhenDialogOpen;
    }

    if (Array.isArray(record.args) && record.args.every(isCommandPayload)) {
        rule.args = record.args;
    } else if ('payload' in record && isCommandPayload(record.payload)) {
        rule.payload = record.payload;
    }

    return rule;
}

function isCommandPayload(value: unknown): value is CommandPayload {
    if (
        value === null ||
        value === undefined ||
        typeof value === 'boolean' ||
        typeof value === 'number' ||
        typeof value === 'string'
    ) {
        return true;
    }

    if (Array.isArray(value)) {
        return value.every(isCommandPayload);
    }

    if (typeof value === 'object') {
        return Object.values(value).every(isCommandPayload);
    }

    return false;
}
