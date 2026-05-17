export type ContextKeyPrimitiveValue = boolean | number | string | null | undefined;

export type ContextKeyValue =
    | ContextKeyPrimitiveValue
    | readonly ContextKeyPrimitiveValue[]
    | Record<string, ContextKeyPrimitiveValue>;

export type ContextKeySnapshot = Record<string, ContextKeyValue>;

export type ContextKeyExpression = string | undefined;

export type ContextKeyInspection = {
    expression: ContextKeyExpression;
    matches: boolean;
    referencedKeys: readonly string[];
    snapshot: ContextKeySnapshot;
    error?: Error;
};

export const ContextKey = {
    CommandPaletteOpen: 'commandPaletteOpen',
    DialogOpen: 'dialogOpen',
    Route: 'route',
    TextInputFocus: 'textInputFocus',
    ThemeEffects: 'themeEffects',
    WindowAlwaysOnTop: 'window.alwaysOnTop',
    WindowDevtoolsAvailable: 'window.devtoolsAvailable',
    WindowFullscreen: 'window.fullscreen'
} as const;

export type ContextKey = (typeof ContextKey)[keyof typeof ContextKey];
