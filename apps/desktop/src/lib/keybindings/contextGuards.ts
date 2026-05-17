import { ContextKey } from '$lib/context-keys';

export type KeybindingGuardOptions = {
    allowInTextInput?: boolean;
    allowWhenDialogOpen?: boolean;
};

export function resolveKeybindingWhen(
    expression: string | undefined,
    options: KeybindingGuardOptions = {}
): string {
    return joinContextExpressions([
        expression,
        options.allowInTextInput ? undefined : `!${ContextKey.TextInputFocus}`,
        options.allowWhenDialogOpen ? undefined : `!${ContextKey.DialogOpen}`
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
