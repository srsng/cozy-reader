import { ContextKey } from '$lib/context-keys';

export type KeybindingGuardOptions = {
    allowInTextInput?: boolean;
    allowWhenDialogOpen?: boolean;
    allowWhenCommandPaletteOpen?: boolean;
};

export function resolveKeybindingWhen(
    expression: string | undefined,
    options: KeybindingGuardOptions = {}
): string {
    return joinContextExpressions([
        expression,
        resolveTextInputGuard(options),
        options.allowWhenDialogOpen ? undefined : `!${ContextKey.DialogOpen}`,
        options.allowWhenCommandPaletteOpen ? undefined : `!${ContextKey.CommandPaletteOpen}`
    ]);
}

export function joinContextExpressions(expressions: readonly (string | undefined)[]): string {
    return expressions
        .filter((expression): expression is string => Boolean(expression?.trim()))
        .map(parenthesizeExpression)
        .join(' && ');
}

function parenthesizeExpression(expression: string): string {
    return `(${expression})`;
}

function resolveTextInputGuard(options: KeybindingGuardOptions): string | undefined {
    if (options.allowInTextInput) return undefined;
    if (options.allowWhenCommandPaletteOpen) {
        return `!${ContextKey.TextInputFocus} || ${ContextKey.CommandPaletteOpen}`;
    }

    return `!${ContextKey.TextInputFocus}`;
}
